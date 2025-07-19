const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Đường dẫn thư mục uploads tuyệt đối
const uploadDir = path.join(__dirname, "../../uploads");
// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình nơi lưu trữ và tên file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Thư mục lưu ảnh
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Lọc file chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isValid = allowedTypes.test(file.mimetype);
  if (isValid) cb(null, true);
  else cb(new Error("Chỉ cho phép file ảnh."));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});

module.exports = upload;
