const RequisitionRepository = require("../repositories/RequisitionRepository");

class RequisitionService {
  async getMany(params) {
    return await RequisitionRepository.findMany(params);
  }

  async getById(id) {
    return await RequisitionRepository.findById(id);
  }

  async create(data) {
    return await RequisitionRepository.create(data);
  }

  async update(id, data) {
    return await RequisitionRepository.update(id, data);
  }

  async delete(id) {
    return await RequisitionRepository.delete(id);
  }
}

module.exports = new RequisitionService();
