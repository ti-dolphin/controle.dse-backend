const {prisma} = require('../database');
const { buildWhere } = require('../utils');

class RequistionItemRepository {
  async getMany(params) {
    const where = buildWhere(params, ['id_requisicao']);
    return prisma.web_requisicao_items.findMany({ where });
  }

  async getById(id_item_requisicao) {
    return prisma.web_requisicao_items.findUnique({
      where: { id_item_requisicao },
    });
  }

  async create(data) {
    return prisma.web_requisicao_items.create({
      data,
    });
  }

  async update(id_item_requisicao, data) {
    return prisma.web_requisicao_items.update({
      where: { id_item_requisicao },
      data,
    });
  }

  async delete(id_item_requisicao) {
    return prisma.web_requisicao_items.delete({
      where: { id_item_requisicao },
    });
  }
}
module.exports = new RequistionItemRepository();
