
const RequisitionCommentRepository = require("../repositories/RequisitionCommentRepository");

class RequisitionCommentService {
  async create(data) {
    return RequisitionCommentRepository.create(data);
  }

  async getMany(params) {
    return RequisitionCommentRepository.getMany(params);
  }

  async getById(id) {
    return RequisitionCommentRepository.getById(id);
  }

  async update(id, data) {
    return RequisitionCommentRepository.update(parseInt(id), data);
  }

  async delete(id) {
    return RequisitionCommentRepository.delete(parseInt(id));
  }
}

module.exports = new  RequisitionCommentService();
