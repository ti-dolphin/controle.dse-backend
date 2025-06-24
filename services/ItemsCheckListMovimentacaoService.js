const ItemsCheckListMovimentacaoRepository = require("../repositories/ItemsCheckListMovimentacaoRepository");

class ItemsCheckListMovimentacaoService {
  async create(data) {
    return ItemsCheckListMovimentacaoRepository.create(data);
  }

  async getMany(params) {
    return ItemsCheckListMovimentacaoRepository.getMany(params);
  }

  async getById(id_item_checklist_movimentacao) {
    return ItemsCheckListMovimentacaoRepository.getById(id_item_checklist_movimentacao);
  }

  async update(id_item_checklist_movimentacao, data) {
    return ItemsCheckListMovimentacaoRepository.update(id_item_checklist_movimentacao, data);
  }

  async delete(id_item_checklist_movimentacao) {
    return ItemsCheckListMovimentacaoRepository.delete(id_item_checklist_movimentacao);
  }
}

module.exports = new ItemsCheckListMovimentacaoService();
