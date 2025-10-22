const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/UserRepository");

class UserService {
  async getById(CODPESSOA) {
    const user = await UserRepository.getById(CODPESSOA);
    return user;
  }

  async getMany(query) {
    const users = await UserRepository.getMany(query);
    return users;
  }

  async getComercialUsers() {
    const users = await UserRepository.getComercialUsers();
    return users;
  }

  async isAdmin(user) {
    if(!user) return false;
    const isAdmin = Number(user.PERM_ADMINISTRADOR) === 1;
    return isAdmin;
  }
  
  async login(payload) {np
    const { LOGIN, SENHA } = payload;
    const user = await UserRepository.getUserByLogin(LOGIN);
    if (!user) {
      throw new Error("Login Inválido");
    }
    const hashedPassword = crypto
      .createHash("md5")
      .update(SENHA)
      .digest("hex")
      .toUpperCase();
    if (user.SENHA !== hashedPassword) {
      throw new Error("E-mail ou senha inválidos");
    }
    const token = jwt.sign(
      { LOGIN, SENHA },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "14d" }
    );
    return { user, token };
  }

  async create(payload) {
    const user = UserRepository.create(payload);
    return user;
  }

  async update(COPESSOA, payload) {
    const updatedUser = await UserRepository.update(COPESSOA, payload);
    return updatedUser;
  }

  async delete(CODPESSOA) {
    const deletedUser = await UserRepository.delete(CODPESSOA);
    return deletedUser;
  }
}
module.exports = new UserService();
