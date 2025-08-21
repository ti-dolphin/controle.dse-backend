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

    const items = await prisma.web_requisicao_items.findMany({
      where: {
        ...params,
        ...generalFilters,
      },
      include: this.include(),
    });
    return items.map(this.format);
  }

  async getById(id_item_requisicao) {
    return prisma.web_requisicao_items.findUnique({
      where: { id_item_requisicao },
      include: this.include(),
    }).then(this.format);
  }

  async create(data) {
    return prisma.web_requisicao_items.create({
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

    await prisma.web_requisicao_items.createMany({
      data: items,
    });

    return await this.getMany({ id_requisicao, id_produto: { in: productIds } });
  }

  async update(id_item_requisicao, data) {
    return prisma.web_requisicao_items.update({
      where: { id_item_requisicao },
      data,
      include: this.include(),
    }).then(this.format);
  }

  async updateShippingDate(ids, date) {
    await prisma.web_requisicao_items.updateMany({
      where: { id_item_requisicao: { in: ids } },
      data: { data_entrega: date },
    });

    return await this.getMany({ id_item_requisicao: { in: ids } });
  }

  async updateOCS(ids, oc) {
    await prisma.web_requisicao_items.updateMany({
      where: { id_item_requisicao: { in: ids } },
      data: { oc },
    });

    return await this.getMany({ id_item_requisicao: { in: ids } });
  }

  async delete(id_item_requisicao) {
    return prisma.web_requisicao_items.delete({
      where: { id_item_requisicao },
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
      items_cotacao: item.web_items_cotacao,
    };
    delete formattedItem.web_items_cotacao;
    delete formattedItem.produtos;
    return formattedItem;
  }
}

module.exports = new RequistionItemRepository();

