const nhanVienModel = require("../models/nhanvien.model");
const docGiaModel = require("../models/docgia.model");
const trangThaiDocGiaModel = require("../models/trangthaidocgia.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { findById, findByIdAndUpdate } = require("../models/counter");
require("dotenv").config();
module.exports = class NhanVienService {
  async getMyAccount(id) {
    const staff = await nhanVienModel.findById(id).select("-Password");
    if (!staff) {
      return {
        message: "Nhân viên không tồn tại.",
      };
    } else {
      return {
        nhanvien: staff,
        message: "Lấy thông tin nhân viên thành công.",
      };
    }
  }
  async register(data) {
    const kiemTraNV = await nhanVienModel.findOne({
      $or: [
        { SoDienThoai: data.SoDienThoai.trim() },
        { Email: data.Email.trim().toLowerCase() },
      ],
    });
    if (kiemTraNV) {
      return {
        message: "Số điện thoại hoặc Email đã đăng ký tài khoản nhân viên.",
      };
    } else {
      if (!data.HoTenNV) {
        return {
          message: "Họ tên nhân viên không được để trống.",
        };
      }
      const hashedPassword = await bcrypt.hash(data.Password, 10);
      data.Password = hashedPassword;
      data.SoDienThoai = data.SoDienThoai.trim();
      data.Email = data.Email.trim().toLowerCase();
      const newNV = new nhanVienModel(data);
      await newNV.save();
      const { Password, ...staffInfo } = newNV._doc;
      return {
        nhanvien: staffInfo,
        message: "Đăng ký tài khoản nhân viên thành công.",
      };
    }
  }

  async login(data) {
    if (!data.identifier) {
      return {
        message: "Vui lòng nhập số điện thoại hoặc email để đăng nhập.",
      };
    }
    const staff = await nhanVienModel.findOne({
      $or: [
        { SoDienThoai: data.identifier.trim().toLowerCase() },
        { Email: data.identifier.trim().toLowerCase() },
      ],
    });
    if (!staff) {
      return {
        message: "Số điện thoại/Email này chưa có tài khoản.",
      };
    } else {
      const isMatch = await bcrypt.compare(data.Password, staff.Password);
      if (!isMatch) {
        return {
          message: "Mật khẩu không đúng.",
        };
      }
      const { Password, ...staffInfo } = staff._doc;
      const token = jwt.sign(
        staffInfo,
        process.env.JWT_SECRET || "NienLuanNganh",
        { expiresIn: "30s" }
      );
      const refreshToken = jwt.sign(
        {
          id: staff._id,
          ChucVu: staff.ChucVu,
        },
        process.env.JWT_REFRESH_SECRET || "RefreshSecretKey",
        { expiresIn: "7d" }
      );
      await nhanVienModel.findByIdAndUpdate(staff._id, {
        RefreshToken: refreshToken,
      });
      return {
        token,
        refreshToken,
        nhanvien: staffInfo,
        message: "Đăng nhập thành công.",
      };
    }
  }
  async updateAccountStaff(id, data) {
    const kiemTraStaff = await nhanVienModel.findOne({
      _id: { $ne: id },
      $or: [
        { SoDienThoai: data.SoDienThoai.trim() },
        { Email: data.Email.trim().toLowerCase() },
      ],
    });
    if (kiemTraStaff) {
      return {
        message: "Số điện thoại hoặc email đã tồn tại.",
      };
    }
    const updateStaff = await nhanVienModel
      .findByIdAndUpdate(id, data, {
        new: true,
      })
      .select("-Password");
    if (!updateStaff) {
      return {
        message: "Tài khoản nhân viên không tồn tại.",
      };
    } else {
      return {
        nhanvien: updateStaff,
        message: "Cập nhật tài khoản nhân viên thành công.",
      };
    }
  }
  async changePassword(id, currentPassword, newPassword) {
    const staff = await nhanVienModel.findById(id);
    if (!staff) {
      return {
        message: "Nhân viên không tồn tại.",
      };
    } else {
      const isMatch = await bcrypt.compare(currentPassword, staff.Password);
      if (!isMatch) {
        return {
          message: "Mật khẩu cũ không đúng.",
        };
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      staff.Password = hashedPassword;
      await staff.save();
      return {
        message: "Đổi mật khẩu thành công.",
      };
    }
  }
  async delete(id) {
    const deleteStaff = await nhanVienModel.findByIdAndDelete(id);
    if (!deleteStaff) {
      return {
        message: "Tài khoản không tồn tại.",
      };
    } else {
      return {
        message: "Xóa tài khoản thành công.",
      };
    }
  }
  async getAllReaders() {
    const readers = await docGiaModel
      .find()
      .select("-Password")
      .populate("MaTT");
    const countReader = await docGiaModel.countDocuments();
    if (readers.length === 0) {
      return {
        message: "Chưa có độc giả đăng ký.",
      };
    } else {
      return {
        danhsachdocgia: readers,
        count: countReader,
        message: "Lấy danh sách độc giả thành công.",
      };
    }
  }
  async getOneReader(id) {
    const reader = await docGiaModel
      .findById(id)
      .select("-Password")
      .populate("MaTT");
    if (!reader) {
      return {
        message: "Độc giả không tồn tại.",
      };
    } else {
      return {
        docgia: reader,
        message: "Lấy thông tin một độc giả thành công.",
      };
    }
  }
  async updateStatusReader(id, status) {
    const reader = await docGiaModel.findById(id).populate("MaTT");
    if (!reader) {
      return { message: "Độc giả không tồn tại." };
    } else {
      const idStatus = await trangThaiDocGiaModel.findOne({
        TenTT: status.trim().toLowerCase(),
      });
      const updateReader = await docGiaModel
        .findByIdAndUpdate(
          id,
          {
            $set: {
              MaTT: idStatus._id,
            },
          },
          {
            new: true,
          }
        )
        .populate("MaTT");
      return {
        message: "Cập nhật trạng thái tài khoản độc giả thành công.",
        docgia: updateReader,
      };
    }
  }
};
