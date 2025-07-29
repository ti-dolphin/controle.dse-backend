const OpportunityCommentRepository = require("../repositories/OpportunityCommentRepository");

class OpportunityCommentService {
  async getMany(CODOS) {
    return await OpportunityCommentRepository.findMany(CODOS);
  }

  async getById(CODCOMENTARIO) {
    return await OpportunityCommentRepository.findUnique(CODCOMENTARIO);
  }

  async create(data) {
    return await OpportunityCommentRepository.create(data);
  }

  async update(CODCOMENTARIO, data) {
    return await OpportunityCommentRepository.update(CODCOMENTARIO, data);
  }

  async delete(CODCOMENTARIO) {
    return await OpportunityCommentRepository.delete(CODCOMENTARIO);
  }
}

module.exports = new OpportunityCommentService();