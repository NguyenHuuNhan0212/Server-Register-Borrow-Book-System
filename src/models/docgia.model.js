const mongoose = require("mongoose");
const counterModel = require("./counter");

const docGiaSchema = new mongoose.Schema(
  {
    MaDocGia: { type: String, unique: true },
    HoTen: { type: String, required: true },
    NgaySinh: { type: Date, required: true },
    Phai: { type: String },
    DiaChi: { type: String },
    SoDienThoai: { type: String },
    Password: { type: String },
    Email: { type: String, required: true },
    RefreshToken: { type: String },
    //
    MaTT: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bangTTDocGia",
      required: true,
    },
    type: { type: String },
  },
  {
    timestamps: true,
    minimize: false,
    collection: "DOCGIA",
  }
);

docGiaSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await counterModel.findOneAndUpdate(
      {
        _id: "docgia",
      },
      {
        $inc: { seq: 1 },
      },
      {
        new: true,
        upsert: true,
      }
    );
    this.MaDocGia = "DG" + String(counter.seq).padStart(4, "0");
  }
  next();
});

module.exports = mongoose.model("bangDocGia", docGiaSchema);
