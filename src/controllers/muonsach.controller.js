const ApiError = require("../ApiError");
const MuonSachService = require("../services/muonsach.service");

module.exports.add = async (req, res, next) => {
  try {
    const MaSachCopy = req.params?.MaSach;
    const MaDocGia = req.user._id;
    const muonSachService = new MuonSachService();
    const result = await muonSachService.add({ MaDocGia, MaSachCopy });
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi đăng ký mượn sách."));
  }
};
module.exports.getAllForUser = async (req, res, next) => {
  try {
    const MaDocGia = req.user._id;
    const muonSachService = new MuonSachService();
    const result = await muonSachService.getAllForUser(MaDocGia);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(
      new ApiError(500, "Lỗi khi lấy danh sách phiếu mượn cho người dùng.")
    );
  }
};
module.exports.getAllForAdmin = async (req, res, next) => {
  try {
    const muonSachService = new MuonSachService();
    const result = await muonSachService.getAllForAdmin();
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(
      new ApiError(500, "Lỗi khi lấy danh sách phiếu mượn cho admin.")
    );
  }
};
module.exports.updateTrangThai = async (req, res, next) => {
  try {
    const MaMuon = req.params?.MaMuon;
    const MaNhanVien = req.staff._id;
    const trangThai = req.body?.TrangThai;
    const muonSachService = new MuonSachService();
    const result = await muonSachService.updateTrangThai(
      MaMuon,
      trangThai,
      MaNhanVien
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi cập nhật trạng thái mượn sách."));
  }
};
module.exports.getBorrowsDeadline = async (req, res, next) => {
  try {
    const muonSachService = new MuonSachService();
    const result = await muonSachService.getAllBorrowDeadline();
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi lấy danh sách sách sắp đến hạn."));
  }
};
module.exports.sendEmailToReader = async (req, res, next) => {
  try {
    const MaMuonSach = req.params?.MaMuonSach;
    const muonSachService = new MuonSachService();
    const result = await muonSachService.sendEmailRemind(MaMuonSach);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(
      new ApiError(500, "Lỗi khi gửi Email nhắc sắp đến hạn trả sách.")
    );
  }
};
module.exports.extendBorrow = async (req, res, next) => {
  try {
    const MaMuonSach = req.params?.MaMuonSach;
    const muonSachService = new MuonSachService();
    const result = await muonSachService.extendBorrow(MaMuonSach);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi gia hạn sách."));
  }
};
module.exports.getBorrowsLateTime = async (req, res, next) => {
  try {
    const muonSachService = new MuonSachService();
    const result = await muonSachService.getBorrowsLateTime();
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi lấy danh sách sách đã quá hạn."));
  }
};
module.exports.cancelBorrowRequest = async (req, res, next) => {
  try {
    const MaMuonSach = req.params?.MaMuon;
    const MaDocGia = req.user._id;
    const muonSachService = new MuonSachService();
    const result = await muonSachService.cancelBorrowRequest(
      MaMuonSach,
      MaDocGia
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi hủy yêu cầu mượn sách."));
  }
};
