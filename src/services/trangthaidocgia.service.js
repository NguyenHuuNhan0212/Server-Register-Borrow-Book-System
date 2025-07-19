const trangThaiDocGiaModel = require("../models/trangthaidocgia.model");
const docGiaModel = require("../models/docgia.model");
const { updateStatusReader } = require("../controllers/nhanvien.controller");

module.exports = class TrangThaiDocGiaService {
  async add(data) {
    if (
      data.TenTT.trim().toLowerCase() !== "active" &&
      data.TenTT.trim().toLowerCase() !== "blocked"
    ) {
      return {
        message: "Bạn chỉ được phép thêm trạng thái active hoặc blocked.",
      };
    }
    const status = await trangThaiDocGiaModel.findOne({
      TenTT: data.TenTT.trim().toLowerCase(),
    });
    if (status) {
      return {
        message: "Trạng thái đã tồn tại.",
      };
    } else {
      data.TenTT = data.TenTT.trim().toLowerCase();
      const newStatus = new trangThaiDocGiaModel(data);
      await newStatus.save();
      return {
        message: "Thêm trạng thái thành công.",
        newStatus,
      };
    }
  }
  async getAll() {
    const statusReaderList = await trangThaiDocGiaModel.find();
    if (statusReaderList.length === 0) {
      return {
        message: "Không có trạng thái độc giả.",
      };
    } else {
      return {
        message: "Lấy danh sách trạng thái độc giả thành công.",
        danhsachtrangthaidocgia: statusReaderList,
      };
    }
  }
  async getOne(id) {
    const statusReader = await trangThaiDocGiaModel.findById(id);
    if (!statusReader) {
      return {
        message: "Trạng thái độc giả không tồn tại.",
      };
    } else {
      return {
        message: "Lấy thông tin trạng thái độc giả thành công.",
        trangthaidocgia: statusReader,
      };
    }
  }
  async delete(id) {
    const statusReader = await trangThaiDocGiaModel.findById(id);
    if (!statusReader) {
      return {
        message: "Trạng thái độc giả không tồn tại.",
      };
    } else {
      const readerCheck = await docGiaModel.findOne({
        MaTT: id,
      });
      if (readerCheck) {
        return {
          message:
            "Hiện tại có độc giả thuộc loại trạng thái này, không được xóa.",
        };
      }
      const deleteStatusReader = await trangThaiDocGiaModel.findByIdAndDelete(
        id
      );
      return {
        message: `Xóa trạng thái "${deleteStatusReader.TenTT}" của độc giả thành công.`,
      };
    }
  }
  async update(id, data) {
    const statusReader = await trangThaiDocGiaModel.findById(id);
    if (!statusReader) {
      return {
        message: "Trạng thái không tồn tại.",
      };
    } else {
      data.TenTT = data.TenTT.trim().toLowerCase();
      const checkStatus = await trangThaiDocGiaModel.findOne({
        _id: { $ne: id },
        TenTT: data.TenTT,
      });
      if (checkStatus) {
        return {
          message: "Trạng thái đã tồn tại.",
        };
      }
      const updateStatusReader = await trangThaiDocGiaModel.findByIdAndUpdate(
        id,
        data,
        { new: true }
      );
      return {
        message: "Cập nhật trạng thái thành công.",
        trangthaidocgia: updateStatusReader,
      };
    }
  }
};
