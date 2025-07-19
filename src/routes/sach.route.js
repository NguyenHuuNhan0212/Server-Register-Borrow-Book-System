const express = require("express");
const router = express.Router();
const sachController = require("../controllers/sach.controller");
const { verifyTokenStaff } = require("../middlewares/verifyToken");

router
  .post("/", verifyTokenStaff, sachController.addBook)
  .get("/", sachController.getAll)
  .get("/hot", sachController.getListBookHot)
  .get("/new", sachController.getListBooksNew)
  .get("/:MaSach", sachController.getOne)
  .patch("/:MaSach", verifyTokenStaff, sachController.update)
  .delete("/:MaSach", verifyTokenStaff, sachController.delete);
module.exports = router;
