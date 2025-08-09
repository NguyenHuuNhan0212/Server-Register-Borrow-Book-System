const muonSachModel = require("../models/theodoimuonsach.model");
const docGiaModel = require("../models/docgia.model");
const sachModel = require("../models/sach.model");
const trangThaiModel = require("../models/trangthaimuon.model");
const sachCopyModel = require("../models/sachCopy.model");
const { sendMail } = require("../utils/mailer");
const { capitalizeWords } = require("../utils/stringUtils");
require("dotenv").config();

module.exports = class MuonSachService {
  async getTrangThaiId(tenTrangThai) {
    const trangThai = await trangThaiModel.findOne({
      TenTrangThai: { $regex: `^${tenTrangThai}$`, $options: "i" },
    });
    return trangThai?._id;
  }
  async add({ MaDocGia, MaSachCopy }) {
    // 1. Kiểm tra độc giả
    const docGia = await docGiaModel.findById(MaDocGia);
    if (!docGia) return { message: "Độc giả không tồn tại." };

    // 2. Kiểm tra sách
    const sachCopy = await sachCopyModel.findById(MaSachCopy);

    const sach = await sachModel.findById(sachCopy.MaSach);
    if (!sach) return { message: "Sách không tồn tại." };

    // 3. Kiểm tra số lượng sách còn
    const maTrangThai = await this.getTrangThaiId("đã lấy");
    const newMaTrangThai = await this.getTrangThaiId("chờ lấy");
    if (!maTrangThai) return { message: 'Không tìm thấy trạng thái "đã lấy".' };
    if (!newMaTrangThai)
      return { message: 'Không tìm thấy trạng thái "chờ lấy".' };
    const sachBanDangLay = await muonSachModel.findOne({
      MaSachCopy: MaSachCopy,
      MaTrangThai: maTrangThai,
      MaDocGia: MaDocGia,
    });
    const sachBanDangKyMuon = await muonSachModel
      .find({
        MaTrangThai: { $in: [maTrangThai, newMaTrangThai] },
        MaDocGia: MaDocGia,
      })
      .populate([
        {
          path: "MaSachCopy",
        },
      ]);
    const daMuonCungDauSach = sachBanDangKyMuon.some(
      (muon) =>
        muon.MaSachCopy?.MaSach?.toString() === sachCopy.MaSach.toString()
    );
    if (daMuonCungDauSach) {
      return {
        message: `Sách "${sach.TenSach}" bạn đã đăng ký mượn hoặc đang mượn không thể đăng ký mượn nữa.`,
      };
    }
    if (sachBanDangLay) {
      return {
        message: `Sách "${sach.TenSach}" bạn đang mượn không thể đăng ký mượn nữa.`,
      };
    }
    const soLuongTon = sachCopy.SoQuyen - sachCopy.SoLuongDaMuon;
    if (soLuongTon <= 0) {
      return {
        message: `Bản sao sách "${sach.TenSach}" đã hết.`,
      };
    }
    // 5. Kiểm tra số sách độc giả đang mượn chưa trả
    const soLuongDangMuon = await muonSachModel.countDocuments({
      MaDocGia,
      $or: [{ MaTrangThai: maTrangThai }, { MaTrangThai: newMaTrangThai }],
    });
    if (soLuongDangMuon >= Number(process.env.MAX_BOOKS_PER_USER)) {
      return {
        message: `Bạn đã đăng ký mượn sách hoặc đang mượn ${soLuongDangMuon} quyển sách. Đã đạt giới hạn cho phép. Vui lòng kiểm tra lịch sử mượn.`,
      };
    }
    const borrows = await muonSachModel.find({
      MaDocGia: MaDocGia,
      MaTrangThai: maTrangThai,
    });
    console.log(borrows);
    if (borrows.length > 0) {
      const check = borrows.some(
        (borrow) => new Date(borrow.NgayTra) < new Date()
      );
      if (check) {
        return {
          message:
            "Bạn đang giữ sách quá hạn không được phép đăng ký mượn. Vui lòng đến thư viện trả sách để được mượn tiếp tục.",
        };
      }
    }
    //Tạo phiếu mượn
    const newMuonSach = await muonSachModel.create({
      MaDocGia,
      MaSachCopy: MaSachCopy,
      MaTrangThai: newMaTrangThai,
      ThoiGianChoLay: new Date(),
    });
    const html = `
  <h3>Xin chào ${capitalizeWords(docGia.HoTen)},</h3>
  <p>Bạn đã đăng ký mượn sách <b>"${capitalizeWords(
    sach.TenSach
  )}"</b>. Vui lòng đến lấy trong <span style="color: red">24 giờ</span>.</p>`;
    sendMail(docGia.Email, "Thông báo đăng ký mượn sách", html);
    await newMuonSach.populate([
      {
        path: "MaDocGia",
        select: "-Password",
      },
      {
        path: "MaSachCopy",
        populate: [
          {
            path: "MaSach",
            populate: [
              {
                path: "TacGia",
              },
              {
                path: "MaLoai",
              },
            ],
          },
          {
            path: "MaViTri",
            select: "TenViTri",
          },
          {
            path: "MaNXB",
            select: "TenNXB",
          },
        ],
      },
      {
        path: "MaTrangThai",
        select: "TenTrangThai",
      },
    ]);
    sachCopy.SoLuongDaMuon = (sachCopy.SoLuongDaMuon || 0) + 1;
    await sachCopy.save();

    return {
      message: "Tạo phiếu mượn thành công.",
      phieumuon: newMuonSach,
    };
  }
  async getAllForUser(MaDocGia) {
    const docGia = await docGiaModel.findById(MaDocGia);
    if (!docGia) {
      return {
        message: "Vui lòng đăng nhập để có thông tin về độc giả.",
      };
    } else {
      const borrows = await muonSachModel
        .find({
          MaDocGia: MaDocGia,
        })
        .sort({ MaMuonSach: -1 })
        .populate([
          {
            path: "MaSachCopy",
            populate: [
              {
                path: "MaSach",
                populate: [
                  {
                    path: "TacGia",
                  },
                  {
                    path: "MaLoai",
                  },
                ],
              },
              {
                path: "MaViTri",
                select: "TenViTri",
              },
              {
                path: "MaNXB",
                select: "TenNXB",
              },
            ],
          },
          {
            path: "MaTrangThai",
            select: "TenTrangThai",
          },
        ]);
      if (borrows.length === 0) {
        return {
          message: "Độc giả chưa mượn quyển sách nào của thư viện.",
        };
      } else {
        return {
          danhsachmuon: borrows,
          message: "Lấy danh sách mượn thành công.",
        };
      }
    }
  }
  async getAllForAdmin() {
    const borrows = await muonSachModel
      .find()
      .populate([
        {
          path: "MaSachCopy",
          populate: [
            {
              path: "MaSach",
              populate: [
                {
                  path: "MaLoai",
                },
                {
                  path: "TacGia",
                },
              ],
            },
            {
              path: "MaViTri",
              select: "TenViTri",
            },
            {
              path: "MaNXB",
              select: "TenNXB",
            },
          ],
        },
        {
          path: "MaTrangThai",
          select: "TenTrangThai",
        },
        {
          path: "MaDocGia",
          select: "-Password",
        },
      ])
      .sort({ MaMuonSach: -1 });
    if (borrows.length === 0) {
      return {
        message: "Chưa có lịch sử mượn sách.",
      };
    } else {
      return {
        danhsachmuon: borrows,
        message: "Lấy danh sách mượn sách thành công",
      };
    }
  }
  async updateTrangThai(MaMuonSach, trangThaiMoi, MaNhanVien) {
    const muonSach = await muonSachModel.findOne({ MaMuonSach });

    if (!muonSach) {
      return { message: "Phiếu mượn không tồn tại." };
    }
    const trangThaiHienTai = await trangThaiModel.findById(
      muonSach.MaTrangThai
    );
    trangThaiMoi = trangThaiMoi.trim();
    const trangThaiMoiDoc = await trangThaiModel.findOne({
      TenTrangThai: { $regex: `^${trangThaiMoi}$`, $options: "i" },
    });

    if (!trangThaiMoiDoc) {
      return { message: `Trạng thái mới "${trangThaiMoi}" không tồn tại.` };
    }

    const tenTrangThaiHienTai =
      trangThaiHienTai?.TenTrangThai?.trim().toLowerCase();
    const tenTrangThaiMoi = trangThaiMoiDoc.TenTrangThai.trim().toLowerCase();

    // Kiểm tra logic chuyển trạng thái hợp lệ
    const hopLe =
      (tenTrangThaiHienTai === "chờ lấy" && tenTrangThaiMoi === "đã lấy") ||
      (tenTrangThaiHienTai === "đã lấy" && tenTrangThaiMoi === "đã trả");

    if (!hopLe) {
      return {
        message: `Không thể chuyển từ trạng thái "${tenTrangThaiHienTai}" sang "${tenTrangThaiMoi}".`,
      };
    }
    const sachCopy = await sachCopyModel.findById(muonSach.MaSachCopy);
    const sach = await sachModel.findById(sachCopy.MaSach);
    // Nếu chuyển sang 'đã lấy' thì cập nhật ngày mượn
    if (tenTrangThaiMoi === "đã lấy") {
      const ngayHienTai = new Date();
      muonSach.NgayMuon = ngayHienTai;

      const ngayTraTuDong = new Date(ngayHienTai);
      ngayTraTuDong.setDate(ngayTraTuDong.getDate() + 3);
      muonSach.NgayTra = ngayTraTuDong;
      //sachCopy.SoLuongDaMuon = (sachCopy.SoLuongDaMuon || 0) + 1;
      sach.SoLuotMuon = (sach.SoLuotMuon || 0) + 1;
      await sachCopy.save();
      await sach.save();
      muonSach.ThoiGianChoLay = null;
    }
    // Nếu chuyển sang 'đã trả' thì cập nhật ngày trả
    if (tenTrangThaiMoi === "đã trả") {
      muonSach.NgayTra = new Date();
      sachCopy.SoLuongDaMuon -= 1;
      await sachCopy.save();
    }

    muonSach.MaTrangThai = trangThaiMoiDoc._id;
    muonSach.MaNhanVien = MaNhanVien;
    await muonSach.save();

    await muonSach.populate([
      {
        path: "MaDocGia",
        select: "-Password",
      },
      {
        path: "MaSachCopy",
        populate: [
          {
            path: "MaSach",
            populate: [
              { path: "TacGia", select: "TenTG" },
              { path: "MaLoai", select: "TenLoai" },
            ],
          },
          { path: "MaViTri", select: "TenViTri" },
          { path: "MaNXB", select: "TenNXB" },
        ],
      },
      {
        path: "MaTrangThai",
        select: "TenTrangThai",
      },
      {
        path: "MaNhanVien",
        select: "-Password",
      },
    ]);

    return {
      message: `Cập nhật trạng thái phiếu mượn thành công.`,
      phieumuon: muonSach,
    };
  }
  async getAllBorrowDeadline() {
    const trangThaiDaLay = await this.getTrangThaiId("đã lấy");
    if (!trangThaiDaLay) {
      return {
        message: "Trạng thái không hợp lệ.",
      };
    }
    const ngayHienTai = new Date();
    const phieuMuonSapHetHan = await muonSachModel
      .find({
        MaTrangThai: trangThaiDaLay,
        NgayTra: {
          $lte: ngayHienTai,
        },
      })
      .populate([
        { path: "MaDocGia", select: "-Password" },
        {
          path: "MaSachCopy",
          populate: [
            {
              path: "MaSach",
              populate: [
                { path: "TacGia", select: "TenTG" },
                { path: "MaLoai", select: "TenLoai" },
              ],
            },

            { path: "MaViTri", select: "TenViTri" },
            { path: "MaNXB", select: "TenNXB" },
          ],
        },
        { path: "MaTrangThai", select: "TenTrangThai" },
      ]);
    if (phieuMuonSapHetHan.length === 0) {
      return {
        message: "Không có phiếu mượn nào sắp đến hạn.",
      };
    }
    return {
      message: `Có ${phieuMuonSapHetHan.length} phiếu mượn sắp đến hạn.`,
      danhsachphieumuon: phieuMuonSapHetHan,
    };
  }
  async sendEmailRemind(MaMuonSach) {
    const muon = await muonSachModel.findOne({ MaMuonSach }).populate([
      {
        path: "MaDocGia",
        select: "-Password",
      },
      {
        path: "MaSachCopy",
        populate: [{ path: "MaSach" }],
      },
    ]);
    if (!muon) {
      return {
        message: "Phiếu mượn không tồn tại.",
      };
    } else {
      const today = new Date();
      const dueDate = new Date(muon.NgayTra);
      const overdueDays = Math.max(
        0,
        Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24))
      );

      const html = `
        <h3>Xin chào ${muon.MaDocGia.HoTen},</h3>
        <p>Bạn đã mượn sách "<strong>${muon.MaSachCopy.MaSach.TenSach}</strong>" và đã quá hạn <strong style="color: red;">${overdueDays} ngày</strong>.</p>
        <p style="color: red;">Vui lòng đến thư viện trả sách để không bị xử lý theo quy định.</p>
      `;

      const docGia = await docGiaModel.findById(muon.MaDocGia);
      await sendMail(docGia.Email, "Thông báo quá hạn", html);
      return {
        message: "Gửi email thông báo quá hạn trả sách thành công.",
      };
    }
  }
  async extendBorrow(MaMuonSach) {
    const muonSach = await muonSachModel.findOne({ MaMuonSach }).populate([
      { path: "MaDocGia", select: "-Password" },
      {
        path: "MaSachCopy",
        populate: [
          {
            path: "MaSach",
          },
        ],
      },
    ]);
    if (!muonSach) {
      return {
        message: "Phiếu mượn không tồn tại.",
      };
    }
    const checkMuonSach = await muonSachModel.findOne({
      MaMuonSach,
      NgayTra: {
        $lt: new Date(),
      },
    });
    if (checkMuonSach) {
      return {
        message: "Quyển sách đã quá hạn trả không được phép gia hạn.",
      };
    }
    const trangThai = await trangThaiModel.findById(muonSach.MaTrangThai);
    const tenTrangThai = trangThai?.TenTrangThai?.toLocaleLowerCase();
    if (tenTrangThai !== "đã lấy") {
      return {
        message: "Chỉ được gia hạn khi sách đang ở trạng thái 'đã lấy'.",
      };
    }
    if (muonSach.DaGiaHan) {
      return {
        message:
          "Phiếu mượn này đã được gia hạn một lần rồi, không thể gia hạn nữa.",
      };
    }
    // Gia hạn thêm 3 ngày
    const ngayTraMoi = new Date(muonSach.NgayTra);
    ngayTraMoi.setDate(ngayTraMoi.getDate() + 3);
    muonSach.NgayTra = ngayTraMoi;
    muonSach.DaGiaHan = true;
    await muonSach.save();

    const html = `<h3>Xin chào ${muonSach.MaDocGia.HoTen},</h3>
    <p>Quyển sách 
    "${muonSach.MaSachCopy.MaSach.TenSach}" của bạn đã được gia hạn.</p>
    <p>Hạn trả mới là: <strong>${ngayTraMoi.toLocaleDateString()}</strong>.</p>`;

    sendMail(muonSach.MaDocGia?.Email, "Gia hạn mượn sách", html);

    return {
      message: "Gia hạn mượn sách thành công.",
      ngayTraMoi: muonSach.NgayTra,
    };
  }
  async cancelBorrowRequest(MaMuonSach, MaDocGia) {
    // Tìm phiếu mượn theo mã
    const phieuMuon = await muonSachModel
      .findOne({ MaMuonSach })
      .populate([
        { path: "MaDocGia", select: "-Password" },
        { path: "MaSachCopy" },
        { path: "MaTrangThai" },
      ]);

    if (!phieuMuon) {
      return { message: "Phiếu mượn không tồn tại." };
    }

    // Kiểm tra độc giả có phải người sở hữu phiếu mượn không
    if (phieuMuon.MaDocGia._id.toString() !== MaDocGia.toString()) {
      return {
        message: "Bạn không có quyền hủy phiếu mượn này.",
      };
    }

    // Chỉ cho phép hủy khi phiếu đang ở trạng thái 'chờ lấy'
    const tenTrangThai =
      phieuMuon.MaTrangThai?.TenTrangThai?.toLowerCase().trim();
    if (tenTrangThai !== "chờ lấy") {
      return {
        message: `Chỉ có thể hủy khi sách đang ở trạng thái "chờ lấy". Trạng thái hiện tại: "${tenTrangThai}".`,
      };
    }
    await sachCopyModel.findByIdAndUpdate(phieuMuon.MaSachCopy, {
      $inc: { SoLuongDaMuon: -1 },
    });
    // Xoá phiếu mượn
    await muonSachModel.deleteOne({ MaMuonSach });

    return {
      message: `Đã hủy thành công yêu cầu mượn sách.`,
    };
  }
  async deleteBorrowBookPendingOneDay() {
    const hanCho = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const idTrangThaiChoLay = await this.getTrangThaiId("chờ lấy");
    const phieuQuaHan = await muonSachModel.find({
      MaTrangThai: idTrangThaiChoLay,
      ThoiGianChoLay: { $lte: hanCho },
    });
    for (const phieu of phieuQuaHan) {
      await sachCopyModel.findByIdAndUpdate(phieu.MaSachCopy, {
        $inc: { SoLuongDaMuon: -1 },
      });
      await muonSachModel.findByIdAndDelete(phieu._id);
    }
    console.log(
      `[${new Date().toISOString()}] Đã xóa  ${
        phieuQuaHan.length
      } phiếu quá hạn.`
    );
  }
};
