const OpportunityRepository = require("../repositories/OpportunityRepository");


class OpportunityService {
  async getById(CODOS) {
    return await OpportunityRepository.getById(CODOS);
  }

  async getMany(params) {
    const{ user, searchTerm, filters, finalizados } = params;
    return await OpportunityRepository.getMany(user, searchTerm, filters, finalizados);
  }

  async getStatuses() {
    return await OpportunityRepository.getStatuses();
  }

  async create(data) {
    return await OpportunityRepository.create(data);
  }

  async update(CODOS, data) {
    return await OpportunityRepository.update(CODOS, data);
  }

  async delete(CODOS) {
    return await OpportunityRepository.delete(CODOS);
  }
}

module.exports = new OpportunityService();
