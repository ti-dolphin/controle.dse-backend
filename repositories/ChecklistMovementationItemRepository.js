const { prisma } = require("../database");
const { buildWhere } = require('../utils');

class ChecklistMovementationItemRepository {
  async create(data) {
    return prisma.web_items_checklist_movimentacao.create({ data });
  }

  async getMany(params) {
    const where = buildWhere(params, ['id_checklist_movimentacao']);
    return prisma.web_items_checklist_movimentacao.findMany({ where });
  }

  async getItemsFromTypeOfPatrimony(id_movimentacao, tx) {
    const mov = await tx.web_movimentacao_patrimonio.findUnique({ where: { id_movimentacao  } });
    const pat = await tx.web_patrimonio.findUnique({ where: { id_patrimonio: mov.id_patrimonio } });
    const type = await tx.web_tipo_patrimonio.findUnique({ where: { id_tipo_patrimonio: pat.tipo } });
    const items = await tx.web_items_checklist_tipo.findMany({ 
      where: {id_tipo_patrimonio: type.id_tipo_patrimonio},
    });
    return items;
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

module.exports = new ChecklistMovementationItemRepository();
