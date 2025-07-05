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

    const items = await prisma.web_requisicao_items
      .findMany({
        where: {
          ...params,
          ...generalFilters,
        },
        include: {
          produtos: true,
        },
      })
      .then((items) =>
        items.map((item) => {
          const formattedItem = {
            ...item,
            produto: item.produtos,
            produto_descricao: item.produtos.descricao,
            produto_codigo: item.produtos.codigo,
            produto_unidade: item.produtos.unidade,
            produto_quantidade_estoque: item.produtos.quantidade_estoque,
          };
          delete formattedItem.produtos;
          return formattedItem;
        })
      );

      return items;
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

  async createMany(payload) {
    const { productIds, id_requisicao } = payload;

    const items = productIds.map((productId) => {
      return {
        id_requisicao,
        id_produto: productId,
        ativo: 1,
        quantidade: 0,
        observacao: "",
      }
    });
    await prisma.web_requisicao_items.createMany({
      data: items
    });
    return await prisma.web_requisicao_items
      .findMany({
        where: {
          id_requisicao,
          id_produto: {
            in: productIds,
          },
        },
        include: {
          produtos: true,
        },
      })
      .then((items) =>
        items.map((item) => {
          const formattedItem = {
            ...item,
            produto: item.produtos,
            produto_descricao: item.produtos.descricao,
            produto_codigo: item.produtos.codigo,
            produto_unidade: item.produtos.unidade,
            produto_quantidade_estoque: item.produtos.quantidade_estoque,
          };
          delete formattedItem.produtos;
          return formattedItem;
        })
      );
    
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
