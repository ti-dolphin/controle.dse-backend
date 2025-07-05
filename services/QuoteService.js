const QuoteRepository = require("../repositories/QuoteRepository");

class QuoteService {
  async getMany(params) {
    return await QuoteRepository.getMany(params);
  }

  async getById(id_cotacao) {
    return await QuoteRepository.getById(id_cotacao);
  }

  async getTaxClassifications() {
    return await QuoteRepository.getTaxClassifications();
  }

  async getPaymentConditions() {
    return await QuoteRepository.getPaymentConditions();
  }

  async getShipmentTypes() {
    return await QuoteRepository.getShipmentTypes();
  }

  async create(data) {
    return await QuoteRepository.create(data);
  }

  async update(id_cotacao, data) {
    return await QuoteRepository.update(id_cotacao, data);
  }

  async delete(id_cotacao) {
    return await QuoteRepository.delete(id_cotacao);
  }
}

module.exports = new QuoteService();