const QuoteItemRepository = require('../repositories/QuoteItemRepository');

class QuoteItemService {
    async getMany(params) {
        return QuoteItemRepository.getMany(params);
    }

    async getById(id_item_cotacao) {
        return QuoteItemRepository.getById(id_item_cotacao);
    }

    async create(data) {
        return QuoteItemRepository.create(data);
    }

    async update(id_item_cotacao, data) {
        return QuoteItemRepository.update(id_item_cotacao, data);
    }

    async delete(id_item_cotacao) {
        return QuoteItemRepository.delete(id_item_cotacao);
    }
}

module.exports = new QuoteItemService();