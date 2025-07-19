const docGiaModel = require("../models/docgia.model");
const muonSachModel = require("../models/theodoimuonsach.model");
const trangThaiMuonModel = require("../models/trangthaimuon.model");
const trangThaiDocGiaModel = require("../models/trangthaidocgia.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
module.exports = class DocGiaService {
  async generateAndSaveTokens(user) {
    const { Password, ...readerInfo } = user._doc;
    const token = jwt.sign(
      readerInfo,
      process.env.JWT_SECRET || "NienLuanNganh",
      { expiresIn: "30s" }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || "RefreshSecretKey",
      { expiresIn: "7d" }
    );
    await docGiaModel.findByIdAndUpdate(user._id, {
      RefreshToken: refreshToken,
    });
    return { token, refreshToken, readerInfo };
  }
  async getMyAccount(id) {
    const reader = await docGiaModel
      .findById(id)
      .select("-Password")
      .populate("MaTT");
    if (!reader) {
      return {
        message: "Tài khoản độc giả không tồn tại.",
      };
    } else {
      return {
        reader,
        message: "Lấy thông tin tài khoản thành công.",
      };
    }
  }
  async register(data) {
    const kiemTraDG = await docGiaModel.findOne({
      $or: [
        { SoDienThoai: data.SoDienThoai.trim() },
        { Email: data.Email.trim().toLowerCase() },
      ],
    });
    if (kiemTraDG) {
      return {
        message: "Số điện thoại hoặc email đã đăng ký tài khoản.",
      };
    } else {
      if (!data.HoTen) {
        return {
          message: "Họ tên không được để trống.",
        };
      }
      const readerStatus = await trangThaiDocGiaModel.findOne({
        TenTT: "active",
      });
      data.MaTT = readerStatus._id;
      const hashedPassword = await bcrypt.hash(data.Password, 10);
      data.Password = hashedPassword;
      data.Email = data.Email.trim().toLowerCase();
      const newDG = new docGiaModel(data);
      await newDG.save();
      await newDG.populate("MaTT");
      const { Password, ...docGiaInfo } = newDG._doc;
      return {
        docgia: docGiaInfo,
        message: "Đăng ký tài khoản thành công.",
      };
    }
  }
  async login(data) {
    if (!data.identifier) {
      return {
        message: "Vui lòng nhập số điện thoại hoặc email để đăng nhập.",
      };
    }
    const reader = await docGiaModel
      .findOne({
        $or: [
          { SoDienThoai: data.identifier.trim().toLowerCase() },
          { Email: data.identifier.trim().toLowerCase() },
        ],
      })
      .populate("MaTT", "TenTT");
    if (reader && reader.MaTT?.TenTT !== "active") {
      return {
        message:
          "Tài khoản của bạn bị khóa do một số lý do, bạn vui lòng liên hệ thư viên để giải quyết.",
      };
    }
    if (!reader) {
      return {
        message: "Số điện thoại/Email này chưa đăng ký tài khoản",
      };
    } else {
      const isMatch = await bcrypt.compare(data.Password, reader.Password);
      if (!isMatch) {
        return {
          message: "Mật khẩu không đúng.",
        };
      }
      const { token, refreshToken, readerInfo } =
        await this.generateAndSaveTokens(reader);
      return {
        token,
        refreshToken,
        reader: readerInfo,
        message: "Đăng nhập thành công.",
      };
    }
  }
  async updateAccount(id, data) {
    const kiemTraReader = await docGiaModel.findOne({
      _id: { $ne: id },
      $or: [
        { SoDienThoai: data.SoDienThoai.trim() },
        { Email: data.Email.trim().toLowerCase() },
      ],
    });
    if (kiemTraReader) {
      return {
        message: "Số điện thoại hoặc Email đã tồn tại.",
      };
    }

    const updatedReader = await docGiaModel
      .findByIdAndUpdate(id, data, {
        new: true,
      })
      .select("-Password");
    if (!updatedReader) {
      return {
        message: "Độc giả không tồn tại.",
      };
    } else {
      return {
        reader: updatedReader,
        message: "Cập nhật tài khoản thành công.",
      };
    }
  }
  async deleteAccount(id) {
    const account = await docGiaModel.findById(id).select("-Password");
    if (!account) {
      return {
        message: "Tài khoản không tồn tại.",
      };
    } else {
      const trangThaiDaLay = await trangThaiMuonModel.findOne({
        TenTrangThai: "đã lấy",
      });
      const accountborrowing = await muonSachModel.find({
        MaDocGia: id,
        MaTrangThai: trangThaiDaLay._id,
      });
      console.log(accountborrowing);
      if (accountborrowing.length > 0) {
        return {
          message:
            "Bạn đang giữ sách của thư viện vui lòng trả sách trước khi xóa tài khoản.",
        };
      }
      const deletedAccount = await docGiaModel
        .findByIdAndDelete(id)
        .select("-Password");
      return {
        deletedAccount,
        message: "Xóa tài khoản thành công.",
      };
    }
  }
  async changePassword(id, currentPassword, newPassword) {
    const reader = await docGiaModel.findById(id);
    if (!reader) {
      return {
        message: "Người dùng không tồn tại.",
      };
    } else {
      const isMatch = await bcrypt.compare(currentPassword, reader.Password);
      if (!isMatch) {
        return {
          message: "Mật khẩu cũ không đúng.",
        };
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      reader.Password = hashedPassword;
      await reader.save();
      return {
        message: "Đổi mật khẩu thành công.",
      };
    }
  }
  async blockReaderLateTimeFiveDays() {
    const trangThaiMuon = await trangThaiMuonModel.findOne({
      TenTrangThai: { $regex: "^đã lấy$", $options: "i" },
    });
    if (!trangThaiMuon)
      return { message: "Không tìm thấy trạng thái 'đã lấy'" };

    const ngayHienTai = new Date();
    const hanChamNhat = new Date(ngayHienTai);
    hanChamNhat.setDate(ngayHienTai.getDate() - 5);

    const danhSachQuaHan = await muonSachModel.find({
      MaTrangThai: trangThaiMuon._id,
      NgayTra: { $lt: hanChamNhat },
    });
    const trangThaiBlocked = await trangThaiDocGiaModel.findOne({
      TenTT: "blocked",
    });

    let soLuongQuaHan = 0;
    for (const muon of danhSachQuaHan) {
      const docGia = await docGiaModel.findById(muon.MaDocGia);
      if (docGia.MaTT.toString() !== trangThaiBlocked._id.toString()) {
        docGia.MaTT = trangThaiBlocked._id;
        await docGia.save();
        soLuongQuaHan++;
      }
    }
    return {
      message: `Đã chặn ${soLuongQuaHan} độc giả quá hạn trả sách hơn 5 ngày.`,
    };
  }
};
