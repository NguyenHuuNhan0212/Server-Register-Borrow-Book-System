const express = require("express");
const cron = require("node-cron");
const cors = require("cors");
const connectDB = require("./src/config/mongoose");
const routes = require("./src/routes/");
const path = require("path");
const ApiError = require("./src/ApiError");
const docGiaService = require("./src/services/docgia.service");
const MuonSachService = require("./src/services/muonsach.service");
const passport = require("passport");
require("dotenv").config();
require("./src/config/passport");
const app = express();
connectDB(process.env.MONGODB_URI);
app.use(passport.initialize());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    message: "Chào mừng đến với trang quản lý mượn trả sách.",
  });
});
app.use("/", routes);
app.use((req, res, next) => {
  next(new ApiError(404, "Resource not Found"));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});
setInterval(async () => {
  const result = await new MuonSachService().deleteBorrowBookPendingOneDay();
}, 60 * 60 * 1000);
cron.schedule("26 12 * * *", async () => {
  const result = await new docGiaService().blockReaderLateTimeFiveDays();
  console.log(`[CRON] ${new Date().toLocaleString()} - ${result.message}`);
});
app.listen(process.env.PORT, () => {
  console.log(`Server chạy ở cổng: ${process.env.PORT}`);
});
