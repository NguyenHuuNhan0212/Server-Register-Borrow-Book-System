const express = require("express");
const router = express.Router();
const nxbController = require("../controllers/nhaxuatban.controller");
const { verifyTokenStaff } = require("../middlewares/verifyToken");

router
  .post("/", verifyTokenStaff, nxbController.addPublisher)
  .get("/", nxbController.getAllPublisher)
  .get("/:MaNXB", verifyTokenStaff, nxbController.getOnePublisher)
  .patch("/:MaNXB", verifyTokenStaff, nxbController.update)
  .delete("/:MaNXB", verifyTokenStaff, nxbController.delete);
module.exports = router;
