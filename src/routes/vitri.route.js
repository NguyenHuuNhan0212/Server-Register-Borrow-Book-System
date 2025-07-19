const express = require("express");
const router = express.Router();
const viTriController = require("../controllers/vitri.controller");
const { verifyTokenStaff } = require("../middlewares/verifyToken");

router
  .post("/", verifyTokenStaff, viTriController.addPosition)
  .get("/", verifyTokenStaff, viTriController.getAll)
  .get("/:MaViTri", verifyTokenStaff, viTriController.getOne)
  .patch("/:MaViTri", verifyTokenStaff, viTriController.update)
  .delete("/:MaViTri", verifyTokenStaff, viTriController.delete);
module.exports = router;
