const ApiError = require("../ApiError");
const DocGiaService = require("../services/docgia.service");
const AuthService = require("../services/auth.service");

// [GET] /readers/me
module.exports.getMyAccount = async (req, res, next) => {
  try {
    const reader = req.user;
    const docGiaService = new DocGiaService();
    const result = await docGiaService.getMyAccount(reader._id);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(
      new ApiError(500, "Lỗi khi lấy thông tin tài khoản người dùng.")
    );
  }
};
//[POST] /readers/register
module.exports.register = async (req, res, next) => {
  try {
    const data = req.body;
    const docGiaService = new DocGiaService();
    const result = await docGiaService.register(data);
    return res.status(201).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi người dùng đăng ký tài khoản."));
  }
};
//[POST] /readers/login
module.exports.login = async (req, res, next) => {
  try {
    const data = req.body;
    const docGiaService = new DocGiaService();
    const result = await docGiaService.login(data);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi người dùng đăng nhập."));
  }
};
//[PATCH] /readers/me
module.exports.updateAccount = async (req, res, next) => {
  try {
    const reader = req.user;
    const data = req.body;
    const docGiaService = new DocGiaService();
    const result = await docGiaService.updateAccount(reader._id, data);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi cập nhật tài khoản người dùng."));
  }
};
//[DELETE] /readers/me
module.exports.deleteMyAccount = async (req, res, next) => {
  try {
    const reader = req.user;
    console.log(reader);
    const docGiaService = new DocGiaService();
    const result = await docGiaService.deleteAccount(reader._id);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi xóa tài khoản từ người dùng."));
  }
};
//[PATCH] /readers/change-password
module.exports.changePassword = async (req, res, next) => {
  try {
    const reader = req.user;
    const { currentPassword, newPassword } = req.body;
    const docGiaService = new DocGiaService();
    const result = await docGiaService.changePassword(
      reader._id,
      currentPassword,
      newPassword
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi đổi mật khẩu."));
  }
};
