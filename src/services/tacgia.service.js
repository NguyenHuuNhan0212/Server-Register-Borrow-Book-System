const tacGiaModel = require("../models/tacgia.model");
const sachModel = require("../models/sach.model");
module.exports = class TacGiaService {
  async getAll() {
    const authorList = await tacGiaModel.find();
    const countAuthor = await tacGiaModel.countDocuments();
    if (authorList.length === 0) {
      return {
        message: "Chưa có tác giả nào.",
      };
    } else {
      return {
        message: "Lấy danh sách tác giả thành công.",
        danhsachtacgia: authorList,
        count: countAuthor,
      };
    }
  }
  async add(data) {
    const authorCheck = await tacGiaModel.findOne({
      TenTG: { $regex: `^${data.TenTG.trim()}$`, $options: "i" },
    });
    if (authorCheck) {
      return {
        message: "Tên tác giả đã tồn tại.",
      };
    } else {
      data.TenTG = data.TenTG.trim();
      const newAuthor = new tacGiaModel(data);
      await newAuthor.save();
      return {
        message: "Thêm tác giả thành công.",
        tacgia: newAuthor,
      };
    }
  }
  async getOne(id) {
    const author = await tacGiaModel.findById(id);
    if (!author) {
      return {
        message: "Tác giả không tồn tại.",
      };
    } else {
      return {
        message: "Lấy thông tin tác giả thành công.",
        tacgia: author,
      };
    }
  }
  async update(id, data) {
    const author = await tacGiaModel.findById(id);
    if (!author) {
      return {
        message: "Tác giả không tồn tại.",
      };
    } else {
      data.TenTG = data.TenTG.trim();
      const authorCheck = await tacGiaModel.findOne({
        _id: { $ne: id },
        TenTG: { $regex: `^${data.TenTG}$`, $options: "i" },
      });
      if (authorCheck) {
        return {
          message: "Tên tác giả đã tồn tại.",
        };
      }
      const updateAuthor = await tacGiaModel.findByIdAndUpdate(id, data, {
        new: true,
      });
      return {
        message: "Cập nhật tác giả thành công.",
        tacgia: updateAuthor,
      };
    }
  }
  async delete(id) {
    const author = await tacGiaModel.findById(id);
    if (!author) {
      return {
        message: "Tác giả không tồn tại.",
      };
    } else {
      const checkBook = await sachModel.findOne({
        TacGia: author._id,
      });
      if (checkBook) {
        return {
          message:
            "Hiện tại có sách của tác giả này nếu xóa sẽ mất tất cả dữ liệu liên quan đến tác giả, không được xóa.",
        };
      }
      const deleteAuthor = await tacGiaModel.findByIdAndDelete(id);
      return {
        message: `Xóa tác giả thành công.`,
      };
    }
  }
};
