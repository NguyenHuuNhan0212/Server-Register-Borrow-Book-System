const sachModel = require("../models/sach.model");
const muonSachModel = require("../models/theodoimuonsach.model");
const sachCopyModel = require("../models/sachCopy.model");
module.exports = class SachService {
  async addBook(data) {
    const tenSachCheck = data.TenSach.trim();
    const kiemTraSach = await sachModel.findOne({
      TenSach: { $regex: `^${tenSachCheck}$`, $options: "i" },
    });

    if (kiemTraSach) {
      return {
        message: `Sách "${data.TenSach}" đã tồn tại.`,
      };
    }

    // 1. Tạo sách trước
    const newSach = new sachModel({
      TenSach: tenSachCheck,
      TacGia: data.TacGia,
      MaLoai: data.MaLoai,
      NamXuatBan: data.NamXuatBan,
      MoTa: data.MoTa,
      image: data.image,
    });

    await newSach.save();

    // 2. Tạo từng bản sao (book_copy)
    const danhSachBanSao = data.BanSao || [];

    for (const ban of danhSachBanSao) {
      await sachCopyModel.create({
        MaSach: newSach._id,
        TenLoaiBanSao: ban.TenLoaiBanSao,
        SoQuyen: ban.SoQuyen,
        SoLuongDaMuon: 0,
        MaViTri: ban.MaViTri,
        MaNXB: ban.MaNXB,
      });
    }
    return {
      message: "Thêm sách và bản sao thành công.",
      sach: newSach,
      soBanSao: danhSachBanSao.length,
    };
  }

  async getAll() {
    const bookList = await sachModel.find().populate([
      { path: "TacGia", select: "TenTG" },
      { path: "MaLoai", select: "TenLoai" },
    ]);
    if (bookList.length === 0) {
      return {
        message: "Không có sách.",
      };
    } else {
      const sachcopies = await sachCopyModel.find().populate([
        {
          path: "MaSach",
          populate: [
            { path: "TacGia", select: "TenTG" },
            { path: "MaLoai", select: "TenLoai" },
          ],
        },
        {
          path: "MaNXB",
        },
      ]);
      return {
        message: "Lấy danh sách sách thành công.",
        danhsachsach: bookList,
        sachcopies,
      };
    }
  }
  async getListBooksHot() {
    const bookList = await sachModel
      .find({
        SoLuotMuon: { $gt: 10 },
      })
      .populate([
        { path: "TacGia", select: "TenTG" },
        { path: "MaLoai", select: "TenLoai" },
      ]);
    if (bookList.length === 0) {
      return {
        message: "Không có sách.",
      };
    } else {
      return {
        message: "Lấy danh sách sách hot thành công.",
        danhsachsach: bookList,
      };
    }
  }
  async getListBooksNew() {
    const bookList = await sachModel
      .find()
      .sort({ MaSach: -1 })
      .populate([
        { path: "TacGia", select: "TenTG" },
        { path: "MaLoai", select: "TenLoai" },
      ])
      .limit(10);
    if (bookList.length === 0) {
      return {
        message: "Không có sách.",
      };
    } else {
      return {
        message: "Lấy danh sách sách mới thành công.",
        danhsachsach: bookList,
      };
    }
  }
  async getOne(MaSach) {
    const book = await sachModel
      .findOne({
        MaSach,
      })
      .populate([
        {
          path: "MaLoai",
        },
        {
          path: "TacGia",
        },
      ]);
    if (!book) {
      return {
        message: "Sách không tồn tại.",
      };
    } else {
      // Lấy danh sách bản sao của sách đó
      const sachCopies = await sachCopyModel
        .find({ MaSach: book._id })
        .populate([
          {
            path: "MaViTri",
          },
          {
            path: "MaNXB",
          },
        ]);
      return {
        message: "Lấy thông tin sách thành công.",
        sach: book,
        sachCopies,
      };
    }
  }
  async update(MaSach, data) {
    const book = await sachModel.findOne({ MaSach });
    if (!book) {
      return {
        message: "Sách không tồn tại.",
      };
    }
    data.TenSach = data.TenSach.trim();
    const checkBook = await sachModel.findOne({
      MaSach: { $ne: MaSach },
      TenSach: { $regex: `^${data.TenSach}$`, $options: "i" },
    });
    if (checkBook) {
      return {
        message: "Tên sách đã tồn tại.",
      };
    }
    const updateBook = await sachModel.findOneAndUpdate({ MaSach }, data, {
      new: true,
    });
    const banSaoHienCo = await sachCopyModel.find({ MaSach: book._id });
    // 2. Cập nhật các bản sao nếu có
    if (data.BanSao && Array.isArray(data.BanSao)) {
      for (const ban of data.BanSao) {
        if (ban._id) {
          // Bản sao đã tồn tại => cập nhật
          await sachCopyModel.findByIdAndUpdate(ban._id, {
            TenLoaiBanSao: ban.TenLoaiBanSao,
            SoQuyen: ban.SoQuyen,
            MaViTri: ban.MaViTri,
            MaNXB: ban.MaNXB,
          });
        } else {
          // Bản sao mới => tạo mới
          await sachCopyModel.create({
            MaSach: book._id,
            TenLoaiBanSao: ban.TenLoaiBanSao,
            SoQuyen: ban.SoQuyen,
            SoLuongDaMuon: 0,
            MaViTri: ban.MaViTri,
            MaNXB: ban.MaNXB,
          });
        }
      }
    }

    const banSaoGuiLen = data.BanSao.map((copy) => copy._id).filter((id) => id);
    const canDelete = banSaoHienCo.filter(
      (copy) => !banSaoGuiLen.includes(copy._id.toString())
    );

    for (const copy of canDelete) {
      await sachCopyModel.findByIdAndDelete(copy._id);
    }
    return {
      message: "Cập nhật sách và các bản sao thành công.",
      sach: updateBook,
    };
  }

  async delete(MaSach) {
    const book = await sachModel.findOne({ MaSach });
    if (!book) {
      return {
        message: "Sách không tồn tại.",
      };
    }
    const sachCopies = await sachCopyModel.find({ MaSach: book._id });
    const copyIds = sachCopies.map((copy) => copy._id);
    const checkBorrowBook = await muonSachModel.findOne({
      MaSachCopy: { $in: copyIds },
    });

    if (checkBorrowBook) {
      return {
        message:
          "Có phiếu mượn đang sử dụng bản sao của quyển sách này, không được xóa.",
      };
    }
    const copyDangMuon = sachCopies.find((copy) => copy.SoLuongDaMuon > 0);
    if (copyDangMuon) {
      return {
        message: `Không thể xóa vì bản sao "${copyDangMuon.TenLoaiBanSao}" đang có sách được mượn.`,
      };
    }

    await sachCopyModel.deleteMany({ MaSach: book._id });
    const deleteBook = await sachModel.findByIdAndDelete(book._id);
    return {
      message: `Xóa sách thành công.`,
    };
  }
};
