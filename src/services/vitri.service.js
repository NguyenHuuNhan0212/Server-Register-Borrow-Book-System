const viTriModel = require("../models/vitri.model");
const sachModel = require("../models/sach.model");
const sachCopyModel = require("../models/sachCopy.model");
module.exports = class ViTriModel {
  async addPosition(data) {
    const kiemTraPosition = await viTriModel.findOne({
      TenViTri: data.TenViTri.trim().toLowerCase(),
    });
    if (kiemTraPosition) {
      return {
        message: "Vị trí đã tồn tại.",
      };
    } else {
      data.TenViTri = data.TenViTri.trim().toLowerCase();
      const newViTri = new viTriModel(data);
      await newViTri.save();
      return {
        vitri: newViTri,
        message: "Thêm vị trí thành công.",
      };
    }
  }
  async getAll() {
    const positions = await viTriModel.find().sort({ TenViTri: 1 });
    const countPosition = await viTriModel.countDocuments();
    if (positions.length === 0) {
      return {
        message: "Không có vị trí nào.",
      };
    } else {
      return {
        danhsachvitri: positions,
        count: countPosition,
        message: "Lấy danh sách vị trí thành công.",
      };
    }
  }
  async getOne(MaViTri) {
    const position = await viTriModel.findOne({
      MaViTri: MaViTri,
    });
    if (!position) {
      return {
        message: "Vị trí không tồn tại.",
      };
    } else {
      return {
        message: "Lấy thông tin chi tiết một vị trí thành công.",
        vitri: position,
      };
    }
  }
  async update(MaViTri, data) {
    const position = await viTriModel.findOne({ MaViTri });
    if (!position) {
      return {
        message: "Vị trí không tồn tại.",
      };
    } else {
      data.TenViTri = data.TenViTri.trim().toLowerCase();
      const kiemTraPosition = await viTriModel.findOne({
        MaViTri: { $ne: MaViTri },
        TenViTri: data.TenViTri.trim().toLowerCase(),
      });
      if (kiemTraPosition) {
        return {
          message: "Vị trí đã tồn tại.",
        };
      }
      const updatePosition = await viTriModel.findOneAndUpdate(
        {
          MaViTri,
        },
        data,
        {
          new: true,
        }
      );
      return {
        message: "Cập nhật vị trí thành công.",
        vitri: updatePosition,
      };
    }
  }
  async delete(MaViTri) {
    const position = await viTriModel.findOne({ MaViTri });
    if (!position) {
      return {
        message: "Vị trí không tồn tại.",
      };
    } else {
      const checkBook = await sachCopyModel.findOne({
        MaViTri: position._id,
      });
      if (checkBook) {
        return {
          message: "Hiện tại có sách ở vị trí này không được xóa.",
        };
      }
      const deletePosition = await viTriModel.findOneAndDelete({ MaViTri });
      return {
        message: `Đã xóa vị trí thành công.`,
      };
    }
  }
};
