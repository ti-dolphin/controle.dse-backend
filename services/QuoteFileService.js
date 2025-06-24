//QuoteFileService
const QuoteFileRepository = require('../repositories/QuoteFileRepository');

class QuoteFileService {
  async create(payload) {
    return await QuoteFileRepository.create(payload);
  }

  async getMany(params) {
    return await QuoteFileRepository.getMany(params);
  }

  async getById(id_anexo_cotacao) {
    return await QuoteFileRepository.getById(id_anexo_cotacao);
  }

  async update(id_anexo_cotacao, payload) {
    return await QuoteFileRepository.update(id_anexo_cotacao, payload);
  }

  async delete(id_anexo_cotacao) {
    return await QuoteFileRepository.delete(id_anexo_cotacao);
  }
}

module.exports = new QuoteFileService();