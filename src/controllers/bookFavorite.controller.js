const ApiError = require("../ApiError");
const BookFavorite = require("../services/bookFavorite.service");

module.exports.getAll = async (req, res, next) => {
  try {
    const MaDocGiaId = req.user._id;
    const bookFavorite = new BookFavorite();
    const result = await bookFavorite.getAll(MaDocGiaId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(
      new ApiError(500, "Lỗi khi lấy danh sách sách yêu thích" + err)
    );
  }
};
module.exports.addBookFavorite = async (req, res, next) => {
  try {
    const MaDocGiaId = req.user._id;
    const MaSachId = req.params?.MaSachId;
    const bookFavorite = new BookFavorite();
    const result = await bookFavorite.addBookFavorite(MaSachId, MaDocGiaId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi thêm sách yêu thích" + err));
  }
};
module.exports.deleteBookFavorite = async (req, res, next) => {
  try {
    const MaDocGiaId = req.user._id;
    const MaSachId = req.params?.MaSachId;
    const bookFavorite = new BookFavorite();
    const result = await bookFavorite.deleteBookFavorite(MaDocGiaId, MaSachId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi xóa sách yêu thích" + err));
  }
};
