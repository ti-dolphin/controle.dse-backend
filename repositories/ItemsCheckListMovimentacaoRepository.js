const { prisma } = require("../database");
const { buildWhere } = require('../utils');

class ItemsCheckListMovimentacaoRepository {
  async create(data) {
    return prisma.web_items_checklist_movimentacao.create({ data });
  }

  async getMany(params) {
    const where = buildWhere(params, ['id_checklist_movimentacao']);
    return prisma.web_items_checklist_movimentacao.findMany({ where });
  }

  async getById(id_item_checklist_movimentacao) {
    return prisma.web_items_checklist_movimentacao.findUnique({
      where: { id_item_checklist_movimentacao },
    });
  }

  async update(id_item_checklist_movimentacao, data) {
    return prisma.web_items_checklist_movimentacao.update({
      where: { id_item_checklist_movimentacao },
      data,
    });
  }

  async delete(id_item_checklist_movimentacao) {
    return prisma.web_items_checklist_movimentacao.delete({
      where: { id_item_checklist_movimentacao },
    });
  }
}

module.exports = new ItemsCheckListMovimentacaoRepository();
