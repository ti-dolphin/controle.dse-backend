const { prisma } = require("../database");
const { buildWhere } = require("../utils");

class RequistionItemRepository {
  async getMany(params, searchTerm) {
    const generalFilters =
      searchTerm && searchTerm.trim() !== ""
        ? {
            OR: [
              { produtos: { descricao: { contains: searchTerm } } },
              { produtos: { codigo: { contains: searchTerm } } },
              { produtos: { unidade: { contains: searchTerm } } },
              { observacao: { contains: searchTerm } },
            ],
          }
        : {};

    const items = await prisma.wEB_REQUISICAO_ITEMS.findMany({
      where: {
        ...params,
        ...generalFilters,
        ativo: 1, // Apenas itens ativos por padrão
      },
      include: {
        ...this.include(),
        web_anexos_item_requisicao: true,
      },
    });
    return items.map(this.format);
  }
  async getAll(id_requisicao) {
    return await prisma.wEB_REQUISICAO_ITEMS.findMany({
      where: { id_requisicao },
      include: this.include(),
    });
  }

  async getById(id_item_requisicao) {
    return prisma.wEB_REQUISICAO_ITEMS.findUnique({
      where: { id_item_requisicao },
      include: this.include(),
    }).then(this.format);
  }

  async create(data) {
    return prisma.wEB_REQUISICAO_ITEMS.create({
      data,
    });
  }

  async createMany(payload) {
    const { productIds, id_requisicao } = payload;

    const items = productIds.map((productId) => {
      return {
        id_requisicao,
        id_produto: productId,
        ativo: 1,
        quantidade: 0,
        observacao: "",
      };
    });

    await prisma.wEB_REQUISICAO_ITEMS.createMany({
      data: items,
    });

    return await this.getMany({ id_requisicao, id_produto: { in: productIds } });
  }

  async crateAttachment(data){ 
    return prisma.web_anexos_item_requisicao.create({data});
  }

  async update(id_item_requisicao, data) {
    return prisma.wEB_REQUISICAO_ITEMS.update({
      where: { id_item_requisicao },
      data,
      include: this.include(),
    }).then(this.format);
  }

  async updateShippingDate(ids, date) {
    await prisma.wEB_REQUISICAO_ITEMS.updateMany({
      where: { id_item_requisicao: { in: ids } },
      data: { data_entrega: date },
    });

    return await this.getMany({ id_item_requisicao: { in: ids } });
  }

  async updateOCS(ids, oc) {
    await prisma.wEB_REQUISICAO_ITEMS.updateMany({
      where: { id_item_requisicao: { in: ids } },
      data: { oc },
    });

    return await this.getMany({ id_item_requisicao: { in: ids } });
  }

  async delete(id_item_requisicao) {
    return prisma.wEB_REQUISICAO_ITEMS.update({
      where: { id_item_requisicao },
      data: { ativo: 0 },
    });
  }

  include() {
    return {
      produtos: true,
      web_items_cotacao: true,
    };
  }

  format(item) {
    const formattedItem = {
      ...item,
      produto: item.produtos,
      produto_descricao: item.produtos.descricao,
      produto_codigo: item.produtos.codigo,
      produto_unidade: item.produtos.unidade,
      produto_quantidade_estoque: item.produtos.quantidade_estoque,
      produto_quantidade_disponivel: item.produtos.quantidade_disponivel,
      quantidade_disponivel: item.quantidade_disponivel,
      items_cotacao: item.web_items_cotacao,
      anexos: item.web_anexos_item_requisicao || []
    };
    delete formattedItem.web_anexos_item_requisicao;
    delete formattedItem.web_items_cotacao;
    delete formattedItem.produtos;
    return formattedItem;
  }
}

module.exports = new RequistionItemRepository();

