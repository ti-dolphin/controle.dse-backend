
const RequisitionCommentRepository = require("../repositories/RequisitionCommentRepository");

class RequisitionCommentService {
  async create(data) {
    return WebComentariosRequsicaoRepository.create(data);
  }

  async getMany(params) {
    return WebComentariosRequsicaoRepository.getMany(params);
  }

  async getById(id) {
    return WebComentariosRequsicaoRepository.getById(id);
  }

  async update(id, data) {
    return WebComentariosRequsicaoRepository.update(id, data);
  }

  async delete(id) {
    return WebComentariosRequsicaoRepository.delete(id);
  }
}

module.exports = new  RequisitionCommentService();
