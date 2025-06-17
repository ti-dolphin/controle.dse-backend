const OpportunityRepository = require("../repositories/OpportunityRepository");


class OpportunityService {
  async getById(CODOS) {
    return await OpportunityRepository.getById(CODOS);
  }

  async getMany(params) {
    return await OpportunityRepository.getMany({ ...params });
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
