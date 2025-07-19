const express = require("express");
const router = express.Router();
const loaiSachController = require("../controllers/loaisach.controller");
const { verifyTokenStaff } = require("../middlewares/verifyToken");

router
  .post("/", verifyTokenStaff, loaiSachController.addLoaiSach)
  .get("/", loaiSachController.getAll)
  .get("/:MaLoai", verifyTokenStaff, loaiSachController.getOne)
  .patch("/:MaLoai", verifyTokenStaff, loaiSachController.update)
  .delete("/:MaLoai", verifyTokenStaff, loaiSachController.delete);

module.exports = router;
