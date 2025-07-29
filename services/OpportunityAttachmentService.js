const OpportunityAttachmentRepository = require("../repositories/OpportunityAttachementRepository");

class OpportunityAttachmentService {
  async getMany(CODOS) {
    return await OpportunityAttachmentRepository.getMany(CODOS);
  }

  async getById(id) {
    return await OpportunityAttachmentRepository.getById(id_anexo_os);
  }

  async create(data) {
    return await OpportunityAttachmentRepository.create(data);
  }

  async update(id, data) {
    return await OpportunityAttachmentRepository.update(id_anexo_os, data);
  }

  async delete(id_anexo_os) {
    return await OpportunityAttachmentRepository.delete(id_anexo_os);
  }
}

module.exports = new OpportunityAttachmentService();

