const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadImage");
const { verifyTokenStaff } = require("../middlewares/verifyToken");

router.post("/", verifyTokenStaff, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file được tải lên." });
  }
  // tao duong dan
  const imgUrl = `/uploads/${req.file.filename}`;
  return res.status(200).json({
    message: "Upload ảnh thành công.",
    imgUrl,
  });
});
module.exports = router;
