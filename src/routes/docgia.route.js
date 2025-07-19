const express = require("express");
const router = express.Router();
const docGiaController = require("../controllers/docgia.controller");
const nhanVienController = require("../controllers/nhanvien.controller");
const {
  verifyTokenUser,
  verifyTokenStaff,
} = require("../middlewares/verifyToken");

// doc gia
router
  .get("/me", verifyTokenUser, docGiaController.getMyAccount)
  .post("/register", docGiaController.register)
  .post("/login", docGiaController.login)
  .delete("/me", verifyTokenUser, docGiaController.deleteMyAccount)
  .patch("/change-password", verifyTokenUser, docGiaController.changePassword)
  .patch("/me", verifyTokenUser, docGiaController.updateAccount)
  //nhan vien
  .get("/", verifyTokenStaff, nhanVienController.getAllReaders)
  .get("/:id", verifyTokenStaff, nhanVienController.getOneReader)
  .patch(
    "/update-status/:id",
    verifyTokenStaff,
    nhanVienController.updateStatusReader
  );
module.exports = router;
