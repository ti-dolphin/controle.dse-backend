const  {prisma} = require('../database');
const { buildWhere } = require('../utils');
const QuoteRepository = require('./QuoteRepository');
const RequisitionItemRepository = require('./RequisitionItemRepository');
class QuoteItemRepository {
    async getMany(params, searchTerm) {
        if(params.id_cotacao){ 
          params.id_cotacao = parseInt(params.id_cotacao);
        }
      
        const generalFilters = {
          OR: [
            {
              web_requisicao_items: {
                produtos: { descricao: { contains: searchTerm } },
              },
            },
            {
              web_requisicao_items: {
                produtos: { codigo: { contains: searchTerm } },
              },
            },
            {
              web_requisicao_items: {
                produtos: { unidade: { contains: searchTerm } },
              },
            },
            { observacao: { contains: searchTerm } }
          ],
        };
        return  prisma.web_items_cotacao.findMany({ 
            where: { 
                ...params,
                ...generalFilters
            }, 
            include: { 
              produtos: true,
              web_requisicao_items :  { 
                include: { 
                  produtos: true
                }
              }
            }
         }).then((items) => (
            items.map((item) => { 
                const formattedItem = {
                  ...item,
                  produto: item.web_requisicao_items.produtos,
                  produto_descricao: item.web_requisicao_items.produtos.descricao,
                  produto_codigo: item.web_requisicao_items.produtos.codigo,
                  produto_unidade: item.web_requisicao_items.produtos.unidade,
                  produto_descricao: item.web_requisicao_items.produtos.descricao,
                  produto_codig: item.web_requisicao_items.produtos.codigo,
                  produto_unidade: item.web_requisicao_items.produtos.unidade,
                };
                delete formattedItem.produtos;
                delete formattedItem.web_requisicao_items;
                return formattedItem;
            })
         ));
    }

    async getById(id_item_cotacao) {
        return await prisma.web_items_cotacao.findUnique({
          where: { id_item_cotacao: Number(id_item_cotacao) },
          include: {
            produtos: true,
            web_requisicao_items: {
              include: {
                produtos: true,
              },
            },
          },
        }).then((item) => {
          const formattedItem = {
            ...item,
            produto: item.web_requisicao_items.produtos,
            produto_descricao: item.web_requisicao_items.produtos.descricao,
            produto_codigo: item.web_requisicao_items.produtos.codigo,
            produto_unidade: item.web_requisicao_items.produtos.unidade,
          };
          delete formattedItem.produtos;
          delete formattedItem.web_requisicao_items;
          return formattedItem;
        });
    }

    async create(payload) {
        return await prisma.web_items_cotacao.create({
           data:  payload
        });
    }

    async createMany(payload) {
        return await prisma.web_items_cotacao.createMany({
            data: payload
        });
    }

    async update(id_item_cotacao, payload) {
        return await prisma.web_items_cotacao
          .update({
            where: { id_item_cotacao: Number(id_item_cotacao) },
            data: payload,
            include: {
              produtos: true,
              web_requisicao_items: {
                include: {
                  produtos: true,
                },
              },
            },
          })
          .then((item) => {
            const formattedItem = {
              ...item,
              produto: item.web_requisicao_items.produtos,
              produto_descricao: item.web_requisicao_items.produtos.descricao,
              produto_codigo: item.web_requisicao_items.produtos.codigo,
              produto_unidade: item.web_requisicao_items.produtos.unidade,
            };
            delete formattedItem.produtos;
            delete formattedItem.web_requisicao_items;
            return formattedItem;
          });
    }

    async delete(id_item_cotacao) {
        return await prisma.web_items_cotacao.delete({
            where: { id_item_cotacao: Number(id_item_cotacao) }
        });
    }

    async getQuoteItemsSelectedInRequisition(id_cotacao) {
        const quote = await QuoteRepository.getById(Number(id_cotacao));
          const reqItems = await RequisitionItemRepository.getMany({
            id_requisicao: Number(quote.id_requisicao),
          });
          const quoteItemsIds = reqItems.map((item) => Number(item.id_item_cotacao));
          //busca todos os itens da cotação que estão selecionados na requisição
          const quoteItemsSelected = await this.getMany({
            id_item_cotacao: { in: quoteItemsIds },
            id_cotacao: Number(id_cotacao),
          });
          return quoteItemsSelected;
    }
}

module.exports = new QuoteItemRepository();