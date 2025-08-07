const PatrimonyRepository = require("../repositories/PatrimonyRepository");

class PatrimonyService {
  async create(payload) {
    return await PatrimonyRepository.create(payload);
  }

  async getMany(params) {
    return await PatrimonyRepository.getMany(params);
  }

  async getTypes() {
    return await PatrimonyRepository.getTypes();
  }

  async getById(id_patrimonio) {
    return await PatrimonyRepository.getById(id_patrimonio);
  }

  async update(id_patrimonio, patrimonyData) {
    return await PatrimonyRepository.update(id_patrimonio, patrimonyData);
  }

  async delete(id_patrimonio) {
    return await PatrimonyRepository.delete(id_patrimonio);
  }
}

module.exports = new PatrimonyService();
