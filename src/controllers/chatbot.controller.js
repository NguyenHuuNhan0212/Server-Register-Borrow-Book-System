const chatbotService = require("../services/chatbot.service");

// API POST /api/chat
exports.chat = async (req, res) => {
  const { message } = req.body;

  // Lấy mã độc giả từ JWT hoặc middleware gán vào req.user
  const MaDocGia = req.user?._id;

  if (!message || !MaDocGia) {
    return res.status(400).json({
      message: "Thiếu nội dung câu hỏi hoặc thông tin người dùng.",
    });
  }

  try {
    const answer = await chatbotService.getResponse(message, MaDocGia);
    return res.status(200).json({ answer });
  } catch (error) {
    console.error("❌ Lỗi chatbot:", error);
    return res.status(500).json({
      message: "Lỗi khi xử lý chatbot.",
      error: error.message,
    });
  }
};
