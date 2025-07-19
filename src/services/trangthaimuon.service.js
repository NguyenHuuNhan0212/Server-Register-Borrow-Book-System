const trangThaiModel = require("../models/trangthaimuon.model");
const muonSachModel = require("../models/theodoimuonsach.model");
module.exports = class TrangThaiService {
  async addTrangThai(data) {
    const kiemTraTrangThai = await trangThaiModel.findOne({
      TenTrangThai: data.TenTrangThai.trim().toLowerCase(),
    });
    if (kiemTraTrangThai) {
      return {
        message: "Trạng thái đã tồn tại",
      };
    } else {
      data.TenTrangThai = data.TenTrangThai.trim().toLowerCase();
      const newTrangThai = new trangThaiModel(data);
      await newTrangThai.save();
      return {
        trangthai: newTrangThai,
        message: "Thêm trạng thái thành công.",
      };
    }
  }
  async getAll() {
    const states = await trangThaiModel.find();
    const countState = await trangThaiModel.countDocuments();
    if (states.length === 0) {
      return {
        message: "Chưa có trạng thái sách nào.",
      };
    } else {
      return {
        danhsachtrangthai: states,
        message: "Lấy danh sách trạng thái thành công.",
        count: countState,
      };
    }
  }
  async getOne(MaTrangThai) {
    const stateDetail = await trangThaiModel.findOne({ MaTrangThai });
    if (!stateDetail) {
      return {
        message: "Trạng thái sách không tồn tại.",
      };
    } else {
      return {
        trangthaisach: stateDetail,
        message: "Lấy thông tin chi tiết trạng thái sách thành công.",
      };
    }
  }
  async delete(MaTrangThai) {
    const state = await trangThaiModel.findOne({ MaTrangThai });
    if (!state) {
      return {
        message: "Trạng thái không tồn tại.",
      };
    } else {
      const checkBorrow = await muonSachModel.findOne({
        MaTrangThai: state._id,
      });
      if (checkBorrow) {
        return {
          message:
            "Hiện tại có phiếu mượn thuộc trạng thái này không được xóa.",
        };
      }
      const deleteState = await trangThaiModel.findOneAndDelete({
        MaTrangThai,
      });
      return {
        message: `Xóa trạng thái tên "${deleteState.TenTrangThai}" thành công.`,
      };
    }
  }
  async update(MaTrangThai, data) {
    const checkStatusBook = await trangThaiModel.findOne({
      MaTrangThai,
    });
    if (!checkStatusBook) {
      return {
        message: "Trạng thái sách không tồn tại.",
      };
    } else {
      data.TenTrangThai = data.TenTrangThai.trim().toLowerCase();
      const check = await trangThaiModel.findOne({
        MaTrangThai: { $ne: MaTrangThai },
        TenTrangThai: data.TenTrangThai,
      });
      if (check) {
        return {
          message: "Tên trạng thái đã tồn tại.",
        };
      }
      const updateStatusBook = await trangThaiModel.findOneAndUpdate(
        {
          MaTrangThai: MaTrangThai,
        },
        data,
        {
          new: true,
        }
      );
      return {
        message: "Cập nhật trạng thái sách thành công.",
        trangthaisach: updateStatusBook,
      };
    }
  }
};
