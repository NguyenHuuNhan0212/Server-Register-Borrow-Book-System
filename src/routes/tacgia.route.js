const express = require("express");
const router = express.Router();
const tacGiaController = require("../controllers/tacgia.controller");
const { verifyTokenStaff } = require("../middlewares/verifyToken");

router
  .get("/", tacGiaController.getAll)
  .get("/:id", verifyTokenStaff, tacGiaController.getOne)
  .post("/", verifyTokenStaff, tacGiaController.add)
  .patch("/:id", verifyTokenStaff, tacGiaController.update)
  .delete("/:id", verifyTokenStaff, tacGiaController.delete);
module.exports = router;
