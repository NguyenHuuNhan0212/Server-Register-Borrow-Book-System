const mongoose = require("mongoose");

async function connect(url) {
  try {
    await mongoose.connect(url);
    console.log("✅Kết nối CSDL thành công.");
  } catch (err) {
    console.error("❌ Kết nối CSDL thất bại:", err.message);
    process.exit(1); // Thoát chương trình nếu không kết nối được
  }
}
module.exports = connect;
