const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbot.controller");
const { verifyTokenUser } = require("../middlewares/verifyToken");

// Không yêu cầu verifyToken
router.post("/", verifyTokenUser, chatbotController.chat);

module.exports = router;
