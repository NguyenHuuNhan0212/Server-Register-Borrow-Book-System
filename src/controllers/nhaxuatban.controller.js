const ApiError = require("../ApiError");
const PublisherService = require("../services/nhaxuatban.service");
//[GET] /publishers
module.exports.getAllPublisher = async (req, res, next) => {
  try {
    const publisherService = new PublisherService();
    const result = await publisherService.getAllPublisher();
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi lấy danh sách nhà xuất bản."));
  }
};
//[GET] /publishers/:MaNXB
module.exports.getOnePublisher = async (req, res, next) => {
  try {
    const MaNXB = req.params?.MaNXB;
    const publisherService = new PublisherService();
    const result = await publisherService.getOnePublisher(MaNXB);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi lấy một nhà xuất bản."));
  }
};
//[POST] /publishers
module.exports.addPublisher = async (req, res, next) => {
  try {
    const data = req.body;
    const publisherService = new PublisherService();
    const result = await publisherService.addPublisher(data);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi thêm nhà xuất bản."));
  }
};
//[PATCH] /publishers/:MaNXB
module.exports.update = async (req, res, next) => {
  try {
    const MaNXB = req.params?.MaNXB;
    const data = req.body;
    const publisherService = new PublisherService();
    const result = await publisherService.update(MaNXB, data);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi cập nhật nhà xuất bản."));
  }
};
//[DELETE] /publishers/:MaNXB
module.exports.delete = async (req, res, next) => {
  try {
    const MaNXB = req.params?.MaNXB;
    const publisherService = new PublisherService();
    const result = await publisherService.delete(MaNXB);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return next(new ApiError(500, "Lỗi khi xóa nhà xuất bản."));
  }
};
