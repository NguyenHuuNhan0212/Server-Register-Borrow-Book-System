const express = require("express");
const router = express.Router();
const trangThaiDocGiaController = require("../controllers/trangthaidocgia.controller");
const { verifyTokenStaff } = require("../middlewares/verifyToken");
router
  .post("/", verifyTokenStaff, trangThaiDocGiaController.add)
  .get("/", verifyTokenStaff, trangThaiDocGiaController.getAll)
  .get("/:id", verifyTokenStaff, trangThaiDocGiaController.getOne)
  .delete("/:id", verifyTokenStaff, trangThaiDocGiaController.delete)
  .patch("/:id", verifyTokenStaff, trangThaiDocGiaController.update);

module.exports = router;
