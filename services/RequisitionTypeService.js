const { prisma } = require('../database');

const RequisitionTypeService = {
  async findMany() {
    return await prisma.web_tipo_requisicao.findMany();
  },

  async findById(id_tipo_requisicao) {
    return await prisma.web_tipo_requisicao.findUnique({
      where: { id_tipo_requisicao },
    });
  },

  async create(data) {
    return await prisma.web_tipo_requisicao.create({
      data,
    });
  },

  async update(id_tipo_requisicao, data) {
    // Verifica se existe antes de atualizar
    const exists = await prisma.web_tipo_requisicao.findUnique({
      where: { id_tipo_requisicao },
    });
    if (!exists) return null;
    return await prisma.web_tipo_requisicao.update({
      where: { id_tipo_requisicao },
      data,
    });
  },

  async delete(id_tipo_requisicao) {
    // Verifica se existe antes de deletar
    const exists = await prisma.web_tipo_requisicao.findUnique({
      where: { id_tipo_requisicao },
    });
    if (!exists) return null;
    await prisma.web_tipo_requisicao.delete({
      where: { id_tipo_requisicao },
    });
    return true;
  },
};

module.exports = RequisitionTypeService;
