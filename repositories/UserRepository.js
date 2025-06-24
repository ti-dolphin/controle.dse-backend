const { prisma } = require("../database");
const { buildWhere } = require("../utils");

class UserRepository {
  async getById(CODPESSOA) {
    return prisma.pessoa.findUnique({
      where: { CODPESSOA: Number(CODPESSOA) },
    });
  }

  async getMany(query = {}) {
    const numericFields = [
      "CODPESSOA",
    ];
    const where = buildWhere(query, numericFields);
    return prisma.pessoa.findMany({ where });
  }

  async getUserByLogin(LOGIN) {
    return prisma.pessoa.findFirst({ where: { LOGIN } });
  }

  async create(payload) {
    return prisma.pessoa.create({ data: payload });
  }

  async update(CODPESSOA, payload) {
    return prisma.pessoa.update({
      where: { CODPESSOA: Number(CODPESSOA) },
      data: payload,
    });
  }

  async delete(CODPESSOA) {
    return prisma.pessoa.delete({ where: { CODPESSOA: Number(CODPESSOA) } });
  }
}

module.exports = new UserRepository();
