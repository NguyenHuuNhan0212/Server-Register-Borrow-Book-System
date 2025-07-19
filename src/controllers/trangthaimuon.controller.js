const ApiError = require("../ApiError");
const TrangThaiService = require("../services/trangthaimuon.service");
//[GET] /states-book
module.exports.getAll = async (req, res, next) => {
  try {
    const trangThaiService = new TrangThaiService();
    const result = await trangThaiService.getAll();
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi lấy danh sách trạng thái."));
  }
};
//[POST] /states-book
module.exports.addTrangThai = async (req, res, next) => {
  try {
    const data = req.body;
    const trangThaiService = new TrangThaiService();
    const result = await trangThaiService.addTrangThai(data);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi thêm trạng thái."));
  }
};
//[GET] /states-book/:MaTrangThai
module.exports.getOne = async (req, res, next) => {
  try {
    const MaTrangThai = req.params?.MaTrangThai;
    const trangThaiService = new TrangThaiService();
    const result = await trangThaiService.getOne(MaTrangThai);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(
      new ApiError(500, "Lỗi khi lấy thông tin chi tiết một trạng thái sách.")
    );
  }
};
//[DELETE] /states-book/:MaTrangThai
module.exports.delete = async (req, res, next) => {
  try {
    const MaTrangThai = req.params?.MaTrangThai;
    const trangThaiService = new TrangThaiService();
    const result = await trangThaiService.delete(MaTrangThai);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi xoá trạng thái sách."));
  }
};
//[PATCH] /states-book/:MaTrangThai
module.exports.update = async (req, res, next) => {
  try {
    const MaTrangThai = req.params?.MaTrangThai;
    const data = req.body;
    const trangThaiService = new TrangThaiService();
    const result = await trangThaiService.update(MaTrangThai, data);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi cập nhật trạng thái sách."));
  }
};
