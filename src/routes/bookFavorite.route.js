const express = require("express");
const router = express.Router();
const bookFavoriteController = require("../controllers/bookFavorite.controller");
const { verifyTokenUser } = require("../middlewares/verifyToken");

router
  .get("/", verifyTokenUser, bookFavoriteController.getAll)
  .post("/:MaSachId", verifyTokenUser, bookFavoriteController.addBookFavorite)
  .delete(
    "/:MaSachId",
    verifyTokenUser,
    bookFavoriteController.deleteBookFavorite
  );
module.exports = router;
