var CheckListRepository = require("../repositories/CheckListRepository");

class CheckListService {
  async create(data) {
    return CheckListRepository.create(data);
  }

  async getMany(params) {
    return CheckListRepository.getMany(params);
  }

  async getById(id_checklist_movimentacao) {
    return CheckListRepository.getById(id_checklist_movimentacao);
  }

  async update(id_checklist_movimentacao, data) {
    return CheckListRepository.update(id_checklist_movimentacao, data);
  }

  async delete(id_checklist_movimentacao) {
    return CheckListRepository.delete(id_checklist_movimentacao);
  }
}

module.exports = new CheckListService();
