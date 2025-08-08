const nodemailer = require("nodemailer");
const { prisma } = require("../database");

class EmailService {
  static transporter = nodemailer.createTransport({
    host: "email-ssl.com.br",
    port: 465,
    auth: {
      user: "comunicacao@dse.com.br",
      pass: "Comunicacao1707@dse",
    },
  });

  static async sendEmail(to, subject, text) {
    try {
      await this.transporter.sendMail({
        from: "comunicacao@dse.com.br",
        to,
        subject,
        html: text,
      });
      return true;
    } catch (e) {
      await prisma.web_email_logs.create({
        data: {
          assunto: "Relatório Semanal de Oportunidades",
          destinatario: to[0],
          sucesso: 0,
          erro: 1,
          error_message: `${e.message}`,
        },
      });
      return false;
    }
  }
}

module.exports = EmailService;
