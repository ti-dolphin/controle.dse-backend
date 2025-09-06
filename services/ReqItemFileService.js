const ReqItemFileRepository = require('../repositories/ReqItemFileRepository');

class ReqItemFileService {
  async getByRequisitionItem(id_item_requisicao) {
    return ReqItemFileRepository.getByRequisitionItem(
      Number(id_item_requisicao)
    );
  }

  async getById(id) {
    return ReqItemFileRepository.getById(id);
  }

  async create(payload) {
    const newFile = await ReqItemFileRepository.create(payload);
    console.log("newFile", newFile);
    return newFile;
  }

  async update(id, payload) {
    return ReqItemFileRepository.update(id, payload);
  }

  async delete(id_anexo_item_requisicao) {
    return ReqItemFileRepository.delete(id_anexo_item_requisicao);
  }
};

module.exports = new ReqItemFileService();