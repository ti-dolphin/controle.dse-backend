const { prisma } = require("../database");

class RequisitionStatusRepository {
  async create(data) {
    return prisma.web_status_requisicao.create({ data });
  }

  async getMany(params) {
    return prisma.web_status_requisicao.findMany({ where: params });
  }

  async getById(id_status_requisicao) {
    return prisma.web_status_requisicao.findUnique({
      where: { id_status_requisicao },
    });
  }

  async update(id_status_requisicao, data) {
    return prisma.web_status_requisicao.update({
      where: { id_status_requisicao },
      data,
    });
  }

  async delete(id_status_requisicao) {
    return prisma.web_status_requisicao.delete({
      where: { id_status_requisicao },
    });
  }
}

module.exports = new RequisitionStatusRepository();
