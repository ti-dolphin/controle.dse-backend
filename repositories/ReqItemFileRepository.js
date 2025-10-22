const {prisma} = require('../database')
const { buildWhere } = require('../utils');

class ReqItemFileRepository {
  async getByRequisitionItem(id_item_requisicao) {
    return prisma.web_anexos_item_requisicao.findMany({
      where: {
        id_item_requisicao,
      },
    });
  }

  async getById(id_anexo_item_requisicao) {
    return prisma.web_anexos_item_requisicao.findUnique({
      where: { id_anexo_item_requisicao },
    });
  }

  async create(payload) {
    console.log("payload", payload);
    // Permitir apenas os campos válidos para criação de arquivo
    const data = {
      arquivo: payload.arquivo,
      id_item_requisicao: payload.id_item_requisicao,
      nome_arquivo: payload.nome_arquivo,
      // Adicione aqui outros campos permitidos para anexo, se houver
    };
    return prisma.web_anexos_item_requisicao.create({
      data,
    });
  }

  async update(id_anexo_item_requisicao, payload) {
    return prisma.web_anexos_item_requisicao.update({
      where: { id_anexo_item_requisicao },
      data: payload,
    });
  }

  async delete(id_anexo_item_requisicao) {
    return prisma.web_anexos_item_requisicao.delete({
      where: { id_anexo_item_requisicao },
    });
  }
}

module.exports = new  ReqItemFileRepository();