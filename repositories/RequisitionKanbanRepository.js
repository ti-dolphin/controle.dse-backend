const { prisma } = require("../database");

class RequisitionKanbanRepository {
  async create(data) {
    return prisma.web_kanban_requisicao.create({ data });
  }

  async getMany(params) {
    return prisma.web_kanban_requisicao.findMany({ where: params });
  }

  async getById(id_kanban_requisicao) {
    return prisma.web_kanban_requisicao.findUnique({
      where: { id_kanban_requisicao },
    });
  }

  async update(id_kanban_requisicao, data) {
    return prisma.web_kanban_requisicao.update({
      where: { id_kanban_requisicao },
      data,
    });
  }

  async delete(id_kanban_requisicao) {
    return prisma.web_kanban_requisicao.delete({
      where: { id_kanban_requisicao },
    });
  }
}

module.exports = new RequisitionKanbanRepository();
