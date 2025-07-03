const pool = require("../database");
const RequisitionItemRepository = require("../repositories/RequisitionItemRepository");
class RequisitionItemService {
  async getMany(params, searchTerm) {
    return await RequisitionItemRepository.getMany(params, searchTerm);
  }

  async getById(id) {
    return await RequisitionItemRepository.getById(id);
  }

  async create(data) {
    return await RequisitionItemRepository.create(data);
  }

  async update(id_item_requisicao, data) {
    return await RequisitionItemRepository.update(id_item_requisicao, data);
  }

  async delete(id_item_requisicao) {
    return await RequisitionItemRepository.delete(id_item_requisicao);
  }
}

module.exports = new RequisitionItemService();
