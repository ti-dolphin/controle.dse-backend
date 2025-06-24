const  {prisma} = require('../database');
const { buildWhere } = require('../utils');

class QuoteItemRepository {
    async getMany(params) {
        const where = buildWhere(params, ['id_cotacao']);
        return await prisma.web_items_cotacao.findMany({ where });
    }

    async getById(id_item_cotacao) {
        return await prisma.web_items_cotacao.findUnique({
            where: { id_item_cotacao: Number(id_item_cotacao) }
        });
    }

    async create(payload) {
        return await prisma.web_items_cotacao.create({
           data:  payload
        });
    }

    async update(id_item_cotacao, payload) {
        return await prisma.web_items_cotacao.update({
            where: { id_item_cotacao: Number(id_item_cotacao) },
            data: payload
        });
    }

    async delete(id_item_cotacao) {
        return await prisma.web_items_cotacao.delete({
            where: { id_item_cotacao: Number(id_item_cotacao) }
        });
    }
}

module.exports = new QuoteItemRepository();