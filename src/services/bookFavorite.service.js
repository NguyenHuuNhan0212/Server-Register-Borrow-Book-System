const bookFavoriteModel = require("../models/sachyeuthich.model");
const sachModel = require("../models/sach.model");
const docGiaModel = require("../models/docgia.model");
module.exports = class BookFavorite {
  async getAll(MaDocGiaId) {
    const docGia = await docGiaModel.findById(MaDocGiaId);
    if (!docGia) {
      return {
        message: "Độc giả không tồn tại.",
      };
    } else {
      const bookFavoriteList = await bookFavoriteModel
        .find({ MaDocGia: MaDocGiaId })
        .populate([
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
        ]);
      if (bookFavoriteList.length === 0) {
        return {
          message: "Không tìm thấy sách yêu thích của độc giả này.",
        };
      } else {
        return {
          bookFavoriteList,
          message: "Lấy danh sách sách yêu thích thành công.",
        };
      }
    }
  }
  async addBookFavorite(MaSachId, MaDocGiaId) {
    const checkBookFavorite = await bookFavoriteModel.findOne({
      MaDocGia: MaDocGiaId,
      MaSach: MaSachId,
    });
    if (checkBookFavorite) {
      return {
        message: "Sách đã nằm trong danh sách yêu thích.",
      };
    } else {
      const bookFavorite = new bookFavoriteModel({
        MaDocGia: MaDocGiaId,
        MaSach: MaSachId,
      });
      await bookFavorite.save();
      return {
        bookFavorite,
        message: "Thêm vào yêu thích thành công.",
      };
    }
  }
};
