const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail", // hoặc smtp
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});
const signature = `
<p>Trân trọng./.<br>Thư viện NLN,</p>
--<br>
Trường Công nghệ Thông tin & Truyền thông - Trường Đại học Cần Thơ<br>
Khu II, Đường 3/2, Xuân Khánh, Ninh Kiều, Cần Thơ<br>
Điện thoại: 0349414282
`;
async function sendMail(to, subject, html) {
  const mailOptions = {
    from: `"Thư viện NLN" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html: html + signature,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendMail,
};
