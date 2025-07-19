const express = require("express");
const router = express.Router();
const passport = require("passport");
const DocGiaService = require("../services/docgia.service");
const authController = require("../controllers/auth.controller");

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.post("/refresh-token", authController.refreshToken);
// @route   GET /auth/google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  // Bước 1: Xác thực với Google, nhưng KHÔNG tạo session
  passport.authenticate("google", {
    session: false,
    // Nếu thất bại, chuyển hướng về trang login của frontend với thông báo lỗi
    failureRedirect: `${process.env.CLIENT_URL}/signinuser?error=google_auth_failed`,
  }),

  // Bước 2: Middleware tùy chỉnh để tạo và gửi token
  async (req, res) => {
    try {
      // Gọi hàm helper đã tạo ở Bước 1
      const tokens = await new DocGiaService().generateAndSaveTokens(req.user);

      // Bước 3: Gửi token về cho client.
      // Cách tốt nhất là chuyển hướng về một trang đặc biệt trên frontend,
      // và đính kèm token vào URL query.
      const redirectURL = `${process.env.CLIENT_URL}/auth/callback?token=${tokens.token}&refreshToken=${tokens.refreshToken}`;

      res.redirect(redirectURL);
    } catch (error) {
      // Xử lý lỗi nếu việc tạo token thất bại
      res.redirect(
        `${process.env.CLIENT_URL}/signinuser?error=token_generation_failed`
      );
    }
  }
);
module.exports = router;
