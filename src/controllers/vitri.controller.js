const ApiError = require("../ApiError");
const PositionService = require("../services/vitri.service");
//[POST] /positions/
module.exports.addPosition = async (req, res, next) => {
  try {
    const data = req.body;
    const positionService = new PositionService();
    const result = await positionService.addPosition(data);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi thêm vị trí sách."));
  }
};
//[GET] /positions
module.exports.getAll = async (req, res, next) => {
  try {
    const positionService = new PositionService();
    const result = await positionService.getAll();
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi lấy danh sách vị trí."));
  }
};
//[GET] /positions/:MaViTri
module.exports.getOne = async (req, res, next) => {
  try {
    const MaViTri = req.params?.MaViTri;
    const positionService = new PositionService();
    const result = await positionService.getOne(MaViTri);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi lấy thông tin một vị trí."));
  }
};
//[PATCH] /positions/:MaViTri
module.exports.update = async (req, res, next) => {
  try {
    const MaViTri = req.params?.MaViTri;
    const data = req.body;
    const positionService = new PositionService();
    const result = await positionService.update(MaViTri, data);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi cập nhật vị trí sách."));
  }
};
//[DELETE] /positions/:MaViTri
module.exports.delete = async (req, res, next) => {
  try {
    const MaViTri = req.params?.MaViTri;
    const positionService = new PositionService();
    const result = await positionService.delete(MaViTri);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi xóa vị trí sách."));
  }
};
