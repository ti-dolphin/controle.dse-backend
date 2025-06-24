const RequisitionKanbanRepository = require("../repositories/RequisitionKanbanRepository");

class RequisitionKanbanService {
  async create(data) {
    return RequisitionKanbanRepository.create(data);
  }

  async getMany(params) {
    return RequisitionKanbanRepository.getMany(params);
  }

  async getById(id_kanban_requisicao) {
    return RequisitionKanbanRepository.getById(id_kanban_requisicao);
  }

  async update(id_kanban_requisicao, data) {
    return RequisitionKanbanRepository.update(id_kanban_requisicao, data);
  }

  async delete(id_kanban_requisicao) {
    return RequisitionKanbanRepository.delete(id_kanban_requisicao);
  }
}

module.exports = new RequisitionKanbanService();
