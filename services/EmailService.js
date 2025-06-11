const nodemailer = require("nodemailer");

class EmailService {
  static transporter = nodemailer.createTransport({
    host: "email-ssl.com.br",
    port: 465,
    auth: {
      user: "comunicacao@dse.com.br",
      pass: "Comunicacao1707@dse",
    },
  });
}

module.exports = EmailService;
