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

  async cloneComments(req, newRequisitionId, tx) {
    const comments = await tx.web_comentarios_requsicao.findMany({
      where: { id_requisicao: req.ID_REQUISICAO },
    });

    if (comments.length) {
      await tx.web_comentarios_requsicao.createMany({
        data: comments.map(({ id_comentario_requisicao, ...rest }) => ({
          ...rest,
          id_requisicao: newRequisitionId,
        })),
      });
    }
  }
}

module.exports = new RequisitionCommentService();
