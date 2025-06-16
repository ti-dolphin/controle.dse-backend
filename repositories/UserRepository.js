const { prisma } = require("../database");

class UserRepository {
  async getMany(query) {
    return await prisma.pessoa.findMany({
      where: query
    }
  );
  }

  async getById(CODPESSOA) {
    return await prisma.pessoa.findFirst({
      where: { CODPESSOA: Number(CODPESSOA) },
    });
  }

  async getUserByLogin(login) {
    return await prisma.pessoa.findFirst({
      where: { LOGIN: login },
    });
  }

  async create(payload) {
    return await prisma.pessoa.create({
      data: payload,
    });
  }

  async update(CODPESSOA, payload) {
    return await prisma.pessoa.update({
      where: { CODPESSOA: Number(CODPESSOA) },
      data: payload
    });
  }

  async delete(CODPESSOA) {
    return await prisma.pessoa.delete({
      where: { CODPESSOA: Number(CODPESSOA) },
    });
  }
}

module.exports = new UserRepository();
