const { prisma } = require("../database");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
class UserService {

  static async logIn(req) {
    try{ 
        const { username, password } = req.body;
        if (!username || !password) {
          throw new Error("Username and password are required");
        }
        const user = await this.verifyCredentials(username, password);
        if (!user) {
          throw new Error("Invalid username or password");
        }
        const token = this.generateToken({ username });
        return { user, token };
    }catch(e){ 
      throw e;
    }
  }

  static async verifyCredentials(username, password) {
    const hashedPassword = this.hashPassword(password);
    const user = await prisma.pessoa.findFirst({
      select: {
        CODPESSOA: true,
        CODGERENTE: true,
        PERM_REQUISITAR: true,
        PERM_CADASTRAR_PAT: true,
        PERM_COMPRADOR: true,
        PERM_ADMINISTRADOR: true,
        NOME: true,
        LOGIN: true,
        SENHA: true
      },
      where: {
        LOGIN: username,
        SENHA: hashedPassword,
      },
    });
    if (user.SENHA !== hashedPassword || user.LOGIN !== username) {
      throw new Error(`Senha ou login inválido \n senha recebida: ${hashedPassword} \n senha correta: ${user.SENHA}`);
    }
    return user;
  }

  static hashPassword(password) {
    return crypto.createHash("md5").update(password).digest("hex").toUpperCase();
  }

  static generateToken(payload) {
    const expiresIn = "1d";
    return jwt.sign(payload, process.env.SECRET_TOKEN, { expiresIn });
  }
}
module.exports = UserService;