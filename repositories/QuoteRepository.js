const { prisma } = require("../database.js");
const { buildWhere } = require("../utils");

class QuoteRepository {
  async getMany(params) {
    const where = buildWhere(params, ["id_requisicao"]);
    return await prisma.web_cotacao.findMany({ where });
  }

  async getById(id_cotacao) {
    return await prisma.web_cotacao.findUnique({ where: { id_cotacao } });
  }

  async create(data) {
    return await prisma.web_cotacao.create({ data });
  }

  async update(id_cotacao, data) {
    return await prisma.web_cotacao.update({
      where: { id_cotacao },
      data,
    });
  }

  async delete(id_cotacao) {
    return await prisma.web_cotacao.delete({ where: { id_cotacao } });
  }
}
module.exports = new QuoteRepository();
