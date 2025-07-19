const loaiSachModel = require("../models/loaisach.model");
const sachModel = require("../models/sach.model");

module.exports = class LoaiSachService {
  async addLoaiSach(data) {
    const tenLoaiCheck = data.TenLoai.trim();
    const kiemTraLS = await loaiSachModel.findOne({
      TenLoai: { $regex: `^${tenLoaiCheck}$`, $options: "i" },
    });
    if (kiemTraLS) {
      return {
        message: "Loại sách đã tồn tại.",
      };
    } else {
      data.TenLoai = data.TenLoai.trim();
      const newLoaiSach = new loaiSachModel(data);
      await newLoaiSach.save();
      return {
        loaisach: newLoaiSach,
        message: "Thêm loại sách thành công.",
      };
    }
  }
  async getAll() {
    const categorys = await loaiSachModel.find();
    const countCategory = await loaiSachModel.countDocuments();
    if (categorys.length === 0) {
      return {
        message: "Chưa có loại sách nào.",
      };
    } else {
      return {
        message: "Lấy danh sách loại sách thành công.",
        danhsachloaisach: categorys,
        count: countCategory,
      };
    }
  }
  async getOne(MaLoai) {
    const categoryBook = await loaiSachModel.findOne({
      MaLoai: MaLoai,
    });
    if (!categoryBook) {
      return {
        message: "Loại sách không tồn tại",
      };
    } else {
      return {
        message: "Lấy thông tin loại sách thành công.",
        loaisach: categoryBook,
      };
    }
  }
  async update(MaLoai, data) {
    const categoryBook = await loaiSachModel.findOne({
      MaLoai: MaLoai,
    });
    if (!categoryBook) {
      return {
        message: "Loại sách không tồn tại.",
      };
    } else {
      data.TenLoai = data.TenLoai.trim();
      const kiemTra = await loaiSachModel.findOne({
        MaLoai: { $ne: MaLoai },
        TenLoai: { $regex: `^${data.TenLoai}$`, $options: "i" },
      });
      if (kiemTra) {
        return {
          message: "Loại sách đã tồn tại.",
        };
      }
      const updateCategoryBook = await loaiSachModel.findOneAndUpdate(
        {
          MaLoai: MaLoai,
        },
        data,
        {
          new: true,
        }
      );
      return {
        message: "Cập nhật loại sách thành công.",
        loaisach: updateCategoryBook,
      };
    }
  }
  async delete(MaLoai) {
    const categoryBook = await loaiSachModel.findOne({ MaLoai: MaLoai });
    if (!categoryBook) {
      return {
        message: "Loại sách không tồn tại.",
      };
    } else {
      const checkBook = await sachModel.findOne({ MaLoai: categoryBook._id });
      if (checkBook) {
        return {
          message:
            "Hiện tại có sách thuộc loại này nếu xóa sẽ mất dữ liệu, không được xóa.",
        };
      }
      const deleteCategoryBook = await loaiSachModel.findByIdAndDelete(
        categoryBook._id
      );
      return {
        message: `Đã xóa loại sách thành công.`,
      };
    }
  }
};
