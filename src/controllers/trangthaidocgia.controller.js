const ApiError = require("../ApiError");
const TrangThaiDocGiaService = require("../services/trangthaidocgia.service");

//[POST] /status-reader
module.exports.add = async (req, res, next) => {
  try {
    const data = req.body;
    const trangThaiDocGiaService = new TrangThaiDocGiaService();
    const result = await trangThaiDocGiaService.add(data);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi thêm trạng thái độc giả."));
  }
};
//[GET] /status-reader
module.exports.getAll = async (req, res, next) => {
  try {
    const trangThaiDocGiaService = new TrangThaiDocGiaService();
    const result = await trangThaiDocGiaService.getAll();
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi lấy danh sách trạng thái độc giả."));
  }
};
//[GET] /status-reader/:id
module.exports.getOne = async (req, res, next) => {
  try {
    const id = req.params?.id;
    const trangThaiDocGiaService = new TrangThaiDocGiaService();
    const result = await trangThaiDocGiaService.getOne(id);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(
      new ApiError(500, "Lỗi khi lấy thông tin chi tiết trạng thái độc giả.")
    );
  }
};
//[DELETE] /status-reader/:id
module.exports.delete = async (req, res, next) => {
  try {
    const id = req.params?.id;
    const trangThaiDocGiaService = new TrangThaiDocGiaService();
    const result = await trangThaiDocGiaService.delete(id);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi xóa trạng thái độc giả."));
  }
};
// [PATCH] /status-reader/:id
module.exports.update = async (req, res, next) => {
  try {
    const id = req.params?.id;
    const data = req.body;
    const trangThaiDocGiaService = new TrangThaiDocGiaService();
    const result = await trangThaiDocGiaService.update(id, data);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi cập nhật trạng thái độc giả."));
  }
};
