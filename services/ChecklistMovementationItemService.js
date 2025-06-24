const ChecklistMovementationItemRepository = require("../repositories/ChecklistMovementationItemRepository");

class ChecklistMovementationItemService {
  async create(data) {
    return ChecklistMovementationItemRepository.create(data);
  }

  async getMany(params) {
    return ChecklistMovementationItemRepository.getMany(params);
  }

  async getById(id_item_checklist_movimentacao) {
    return ChecklistMovementationItemRepository.getById(id_item_checklist_movimentacao);
  }

  async update(id_item_checklist_movimentacao, data) {
    return ChecklistMovementationItemRepository.update(id_item_checklist_movimentacao, data);
  }

  async delete(id_item_checklist_movimentacao) {
    return ChecklistMovementationItemRepository.delete(id_item_checklist_movimentacao);
  }
}

module.exports = new ChecklistMovementationItemService();
