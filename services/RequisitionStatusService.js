const RequisitionStatusRepository = require("../repositories/RequisitionStatusRepository");

class RequisitionStatusService {
  async create(data) {
    return RequisitionStatusRepository.create(data);
  }

  async getMany(params) {
    return RequisitionStatusRepository.getMany(params);
  }

  async getById(id_status_requisicao) {
    return RequisitionStatusRepository.getById(id_status_requisicao);
  }

  async update(id_status_requisicao, data) {
    return RequisitionStatusRepository.update(id_status_requisicao, data);
  }

  async delete(id_status_requisicao) {
    return RequisitionStatusRepository.delete(id_status_requisicao);
  }
}

module.exports = new RequisitionStatusService();
