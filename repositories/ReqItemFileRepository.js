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

  async getById(id) {
    return prisma.web_anexos_item_requisicao.findUnique({
      where: { id: id },
    });
  }

  async create(payload) {
    console.log("payload", payload);
    // Monte explicitamente o objeto data, sem nunca incluir id_anexo_item_requisicao
    const data = {
      arquivo: payload.arquivo,
      id_item_requisicao: payload.id_item_requisicao,
      nome_arquivo: payload.nome_arquivo,
      // Adicione outros campos válidos explicitamente, se houver
    };
    // Garantia extra: remova o campo se por acaso vier em algum lugar
    if ('id_anexo_item_requisicao' in data) {
      delete data.id_anexo_item_requisicao;
    }
    console.log("data enviado ao prisma:", data);
    return prisma.web_anexos_item_requisicao.create({
      data,
    });
  }

  async update(id, payload) {
    return prisma.web_anexos_item_requisicao.update({
      where: { id: id },
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