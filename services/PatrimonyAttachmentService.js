const PatrimonyAttachmentRepository = require("../repositories/PatrimonyAttachmentRepository");

class PatrimonyAttachmentService {
  async create(payload) {
    return await PatrimonyAttachmentRepository.create(payload);
  }

  async getMany(id_patrimonio) {
    return await PatrimonyAttachmentRepository.getMany(id_patrimonio);
  }

  async getById(id_anexo_patrimonio) {
    return await PatrimonyAttachmentRepository.getById(id_anexo_patrimonio);
  }

  async delete(id_anexo_patrimonio) {
    const attachment = await PatrimonyAttachmentRepository.getById(id_anexo_patrimonio);
    if (!attachment) {
      throw new Error("Anexo não encontrado");
    }
    return await PatrimonyAttachmentRepository.delete(id_anexo_patrimonio);
  }
}

module.exports = new PatrimonyAttachmentService();
