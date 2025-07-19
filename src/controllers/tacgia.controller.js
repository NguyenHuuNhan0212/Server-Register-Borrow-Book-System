const ApiError = require("../ApiError");
const TacGiaService = require("../services/tacgia.service");
//[GET] /authors
module.exports.getAll = async (req, res, next) => {
  try {
    const tacGiaService = new TacGiaService();
    const result = await tacGiaService.getAll();
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi lấy danh sách tác giả."));
  }
};
//[GET] /authors/:id
module.exports.getOne = async (req, res, next) => {
  try {
    const id = req.params?.id;
    const tacGiaService = new TacGiaService();
    const result = await tacGiaService.getOne(id);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi lấy thông tin tác giả."));
  }
};
//[POST] /authors
module.exports.add = async (req, res, next) => {
  try {
    const data = req.body;
    const tacGiaService = new TacGiaService();
    const result = await tacGiaService.add(data);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi thêm tác giả."));
  }
};
//[PATCH] /authors/:id
module.exports.update = async (req, res, next) => {
  try {
    const id = req.params?.id;
    const data = req.body;
    const tacGiaService = new TacGiaService();
    const result = await tacGiaService.update(id, data);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi cập nhật thông tin tác giả."));
  }
};
//[DELETE] /authors/:id
module.exports.delete = async (req, res, next) => {
  try {
    const id = req.params?.id;
    const tacGiaService = new TacGiaService();
    const result = await tacGiaService.delete(id);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi xóa tác giả."));
  }
};
