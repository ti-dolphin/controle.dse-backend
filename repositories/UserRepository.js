const { prisma } = require("../database");
const { buildWhere } = require("../utils");

class UserRepository {
  async getById(CODPESSOA) {
    return prisma.pESSOA.findUnique({
      where: { CODPESSOA: Number(CODPESSOA) },
    });
  }

  async getMany(query = {}) {
    const numericFields = [
      "CODPESSOA",
    ];
    const where = buildWhere(query, numericFields);
    return prisma.pESSOA.findMany({ where });
  }

  async getComercialUsers() {
    return prisma.pESSOA.findMany({ where: { PERM_COMERCIAL: 1 } });
  }

  async getUserByLogin(LOGIN) {
    return prisma.pESSOA.findFirst({ where: { LOGIN } });
  }

  async create(payload) {
    return prisma.pESSOA.create({ data: payload });
  }

  async update(CODPESSOA, payload) {
    return prisma.pESSOA.update({
      where: { CODPESSOA: Number(CODPESSOA) },
      data: payload,
    });
  }

  async delete(CODPESSOA) {
    return prisma.pESSOA.delete({ where: { CODPESSOA: Number(CODPESSOA) } });
  }
}

module.exports = new UserRepository();
