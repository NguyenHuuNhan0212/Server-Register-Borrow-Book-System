const express = require("express");
const router = express.Router();
const trangThaiController = require("../controllers/trangthaimuon.controller");
const { verifyTokenStaff } = require("../middlewares/verifyToken");

router
  .post("/", verifyTokenStaff, trangThaiController.addTrangThai)
  .get("/", verifyTokenStaff, trangThaiController.getAll)
  .get("/:MaTrangThai", verifyTokenStaff, trangThaiController.getOne)
  .delete("/:MaTrangThai", verifyTokenStaff, trangThaiController.delete)
  .patch("/:MaTrangThai", verifyTokenStaff, trangThaiController.update);

module.exports = router;
