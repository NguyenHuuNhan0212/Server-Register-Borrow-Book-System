const nhaXuatBanModel = require("../models/nhaxuatban.model");
const sachModel = require("../models/sach.model");
const sachCopyModel = require("../models/sachCopy.model");
module.exports = class NhaXuatBanService {
  async getAllPublisher() {
    const publishers = await nhaXuatBanModel.find();
    const countPublisher = await nhaXuatBanModel.countDocuments();
    if (publishers.length === 0) {
      return {
        message: "Chưa có nhà xuất bản nào.",
      };
    } else {
      return {
        message: "Lấy danh sách nhà xuất bản thành công.",
        danhsachNXB: publishers,
        countPublisher,
      };
    }
  }
  async getOnePublisher(MaNXB) {
    const nhaxuatban = await nhaXuatBanModel.findOne({
      MaNXB: MaNXB,
    });
    if (!nhaxuatban) {
      return {
        message: "Nhà xuất bản không tồn tại.",
      };
    } else {
      return {
        message: "Lấy nhà xuất bản thành công.",
        nhaxuatban: nhaxuatban,
      };
    }
  }
  async addPublisher(data) {
    const kiemTraNXB = await nhaXuatBanModel.findOne({
      TenNXB: { $regex: `^${data.TenNXB.trim()}$`, $options: "i" },
      DiaChi: { $regex: `^${data.DiaChi.trim()}$`, $options: "i" },
    });
    if (kiemTraNXB) {
      return {
        message: "Nhà xuất bản đã tồn tại.",
      };
    } else {
      data.TenNXB = data.TenNXB.trim();
      data.DiaChi = data.DiaChi.trim();
      const nxb = new nhaXuatBanModel(data);
      await nxb.save();
      return {
        nxb: nxb,
        message: "Thêm nhà xuất bản thành công",
      };
    }
  }
  async update(MaNXB, data) {
    const nhaxuatban = await nhaXuatBanModel.findOne({
      MaNXB: MaNXB,
    });
    if (!nhaxuatban) {
      return {
        message: "Nhà xuất bản không tồn tại.",
      };
    } else {
      data.TenNXB = data.TenNXB.trim();
      data.DiaChi = data.DiaChi.trim();
      const kiemTra = await nhaXuatBanModel.findOne({
        MaNXB: { $ne: MaNXB },
        TenNXB: { $regex: `^${data.TenNXB.trim()}$`, $options: "i" },
        DiaChi: { $regex: `^${data.DiaChi.trim()}$`, $options: "i" },
      });
      if (kiemTra) {
        return {
          message: "Nhà xuất bản đã tồn tại",
        };
      }
      const updatePublisher = await nhaXuatBanModel.findOneAndUpdate(
        {
          MaNXB: MaNXB,
        },
        data,
        {
          new: true,
        }
      );
      return {
        message: "Cập nhật nhà xuất bản thành công.",
        nhaxuatban: updatePublisher,
      };
    }
  }
  async delete(MaNXB) {
    const nhaxuatban = await nhaXuatBanModel.findOne({
      MaNXB: MaNXB,
    });
    if (!nhaxuatban) {
      return {
        message: "Nhà xuất bản không tồn tại.",
      };
    } else {
      const checkBook = await sachCopyModel.findOne({
        MaNXB: nhaxuatban._id,
      });
      if (checkBook) {
        return {
          message:
            "Hiện tại có sách được xuất bản từ nhà xuất bản này nếu xóa sẽ mất thông tin, không được xóa.",
        };
      }
      const deletePublisher = await nhaXuatBanModel.findByIdAndDelete(
        nhaxuatban._id
      );
      return {
        message: `Xóa nhà xuất bản thành công.`,
      };
    }
  }
};
