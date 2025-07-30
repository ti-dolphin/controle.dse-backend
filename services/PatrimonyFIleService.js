const PatrymonyFileRepository = require('../repositories/PatrimonyFIleRepository');

class PatrimonyFileService {
  async getMany(params) {
    return await PatrymonyFileRepository.getMany(params);
  }

  async getById(id_anexo_patrimonio) {
    return await PatrymonyFileRepository.getById(id_anexo_patrimonio);
  }

  async create(data) {
    return await PatrymonyFileRepository.create(data);
  }

  async update(id, data) {
    return await PatrymonyFileRepository.update(id, data);
  }

  async delete(id) {
    return await PatrymonyFileRepository.delete(id);
  }
}

module.exports = new PatrimonyFileService();
