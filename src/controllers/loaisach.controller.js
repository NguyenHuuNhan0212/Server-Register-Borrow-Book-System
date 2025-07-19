const ApiError = require("../ApiError");
const LoaiSachService = require("../services/loaisach.service");

//[POST] /categorys
module.exports.addLoaiSach = async (req, res, next) => {
  try {
    const data = req.body;
    const loaiSachService = new LoaiSachService();
    const result = await loaiSachService.addLoaiSach(data);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Có lỗi khi thêm loại sách."));
  }
};
//[GET] /categorys/
module.exports.getAll = async (req, res, next) => {
  try {
    const loaiSachService = new LoaiSachService();
    const result = await loaiSachService.getAll();
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi lấy danh sách loại sách."));
  }
};
//[GET] /categorys/:MaLoai
module.exports.getOne = async (req, res, next) => {
  try {
    const MaLoai = req.params?.MaLoai;
    const loaiSachService = new LoaiSachService();
    const result = await loaiSachService.getOne(MaLoai);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi lấy thông tin một loại sách."));
  }
};
//[PATCH] /categprys/:MaLoai
module.exports.update = async (req, res, next) => {
  try {
    const MaLoai = req.params?.MaLoai;
    const data = req.body;
    const loaiSachService = new LoaiSachService();
    const result = await loaiSachService.update(MaLoai, data);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi cập nhật sách."));
  }
};
//[DELETE] /categorys/:MaLoai
module.exports.delete = async (req, res, next) => {
  try {
    const MaLoai = req.params?.MaLoai;
    const loaiSachService = new LoaiSachService();
    const result = await loaiSachService.delete(MaLoai);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi xóa một loại sách"));
  }
};
