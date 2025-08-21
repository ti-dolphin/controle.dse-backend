const { prisma } = require("../database.js");
const { buildWhere } = require("../utils");

class QuoteRepository {
  async getMany(params) {
    const where = buildWhere(params, ["id_requisicao"]);
    return await prisma.web_cotacao.findMany({ where });
  }

  async getById(id_cotacao) {
    const result = await prisma.web_cotacao
      .findUnique({
        where: { id_cotacao },
        include: {
          web_classificacao_fiscal: true,
          web_tipo_frete: true,
          web_items_cotacao: true
        },
      })
      .then((result) => ({
        ...result,
        classificacao_fiscal: result.web_classificacao_fiscal,
        tipo_frete: result.web_tipo_frete,
        items: result.web_items_cotacao,
      }));

    if (!result) return null;
    delete result.web_classificacao_fiscal;
    delete result.web_tipo_frete;
    return result;
    
  }

  async getTaxClassifications() {
    return await prisma.web_classificacao_fiscal.findMany();
  }

  async getPaymentConditions() {
    return await prisma.web_condicao_pagamento.findMany();
  }

  async getShipmentTypes() {
    return await prisma.web_tipo_frete.findMany();
  }

  async getQuotesByRequisition(id_requisicao) {
    return await prisma.web_cotacao.findMany({ where: { id_requisicao }, select :{ 
      id_cotacao: true,
      fornecedor: true
    } });
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
