const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const docGiaModel = require("../models/docgia.model");
const trangThaiDocGiaModel = require("../models/trangthaidocgia.model");

require("dotenv").config();
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Tìm độc giả bằng email
        let reader = await docGiaModel.findOne({ Email: profile._json.email });

        if (reader) {
          await reader.populate("MaTT", "TenTT"); // Lấy thông tin trạng thái
          if (reader.MaTT?.TenTT !== "active") {
            return done(new Error("Tài khoản của bạn đã bị khóa."), null);
          }
          // Nếu không bị khóa, trả về người dùng đó
          return done(null, reader);
        }

        const readerStatus = await trangThaiDocGiaModel.findOne({
          TenTT: "active",
        });

        const newReader = new docGiaModel({
          HoTen: profile.displayName,
          Email: profile.emails[0].value,
          NgaySinh: "2000-01-01",
          MaTT: readerStatus._id,
          type: "google",
          // Không có mật khẩu khi đăng ký bằng Google
        });

        await newReader.save();
        return done(null, newReader);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
