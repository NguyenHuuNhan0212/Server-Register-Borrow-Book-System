const ApiError = require("../ApiError");
const SachService = require("../services/sach.service");

//[POST] /books
module.exports.addBook = async (req, res, next) => {
  try {
    const sachService = new SachService();
    const book = await sachService.addBook(req.body);
    return res.status(201).json(book);
  } catch (error) {
    console.log(error);
    next(new ApiError(500, "Lỗi khi thêm sách."));
  }
};
//[GET] /books
module.exports.getAll = async (req, res, next) => {
  try {
    const sachService = new SachService();
    const book = await sachService.getAll();
    return res.status(201).json(book);
  } catch (error) {
    console.log(error);
    next(new ApiError(500, "Lỗi khi lấy danh sách sách."));
  }
};
//[GET] /books/hot
module.exports.getListBookHot = async (req, res, next) => {
  try {
    const sachService = new SachService();
    const book = await sachService.getListBooksHot();
    return res.status(201).json(book);
  } catch (error) {
    console.log(error);
    next(new ApiError(500, "Lỗi khi lấy danh sách sách hot."));
  }
};
//[GET] /books/new
module.exports.getListBooksNew = async (req, res, next) => {
  try {
    const sachService = new SachService();
    const book = await sachService.getListBooksNew();
    return res.status(201).json(book);
  } catch (error) {
    console.log(error);
    next(new ApiError(500, "Lỗi khi lấy danh sách sách mới."));
  }
};
//[GET] /books/:MaSach
module.exports.getOne = async (req, res, next) => {
  try {
    const MaSach = req.params?.MaSach;
    const sachService = new SachService();
    const book = await sachService.getOne(MaSach);
    return res.status(201).json(book);
  } catch (error) {
    console.log(error);
    next(new ApiError(500, "Lỗi khi lấy thông tin sách."));
  }
};
//[PATCH] /books/:MaSach
module.exports.update = async (req, res, next) => {
  try {
    const MaSach = req.params?.MaSach;
    const data = req.body;
    const sachService = new SachService();
    const book = await sachService.update(MaSach, data);
    return res.status(200).json(book);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi cập nhật sách."));
  }
};
//[DELETE] /books/:MaSach
module.exports.delete = async (req, res, next) => {
  try {
    const MaSach = req.params?.MaSach;
    const sachService = new SachService();
    const result = await sachService.delete(MaSach);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi xóa sách."));
  }
};
