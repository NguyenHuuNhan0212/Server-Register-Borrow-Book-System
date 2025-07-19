const mongoose = require("mongoose");
const counterModel = require("./counter");

const sachYeuThichSchema = new mongoose.Schema(
  {
    MaSach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bangSach",
      required: true,
    },
    MaDocGia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bangDocGia",
      required: true,
    },
    NgayThem: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
    minimize: false,
    collection: "SACHYEUTHICH",
  }
);
module.exports = mongoose.model("bangSachYeuThich", sachYeuThichSchema);
