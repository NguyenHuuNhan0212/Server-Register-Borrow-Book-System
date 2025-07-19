const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail", // hoặc smtp
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendMail(to, subject, html) {
  const mailOptions = {
    from: `"Thư viện NLN" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendMail,
};
