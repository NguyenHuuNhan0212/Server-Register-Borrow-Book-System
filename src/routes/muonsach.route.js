const express = require("express");
const router = express.Router();
const muonSachController = require("../controllers/muonsach.controller");
const {
  verifyTokenUser,
  verifyTokenStaff,
} = require("../middlewares/verifyToken");

router
  .post("/:MaSach", verifyTokenUser, muonSachController.add)
  .get("/", verifyTokenUser, muonSachController.getAllForUser)
  .get("/admin", verifyTokenStaff, muonSachController.getAllForAdmin)
  .patch(
    "/extend/:MaMuonSach",
    verifyTokenUser,
    muonSachController.extendBorrow
  )
  .patch("/:MaMuon", verifyTokenStaff, muonSachController.updateTrangThai)
  .get(
    "/borrows-deadline",
    verifyTokenStaff,
    muonSachController.getBorrowsDeadline
  )
  .post(
    "/send-email-remind/:MaMuonSach",
    verifyTokenStaff,
    muonSachController.sendEmailToReader
  )
  .delete("/:MaMuon", verifyTokenUser, muonSachController.cancelBorrowRequest);
module.exports = router;
