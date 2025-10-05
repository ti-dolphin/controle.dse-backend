// controle.dse-backend/repositories/webComentariosRequsicaoRepository.js
const { prisma } = require("../database");
const {getNowISODate} = require('../utils')
class RequisitionCommentRepository {
  async create(data) {
    data.data_criacao = getNowISODate();
    data.data_alteracao = getNowISODate();
    return prisma.web_comentarios_requsicao.create({ data,
      include:  {
        ...this.include()
      },
     }).then((comment) => this.format(comment));
  }

  include(){ 
    return {
      PESSOA: {
        select: {
          CODPESSOA: true,
          NOME: true
        },
      },
      web_requisicao: true,
    };
  }

  format(comment){ 
    return {
      id_comentario_requisicao: comment.id_comentario_requisicao,
      id_requisicao: comment.id_requisicao,
      criado_por: comment.criado_por,
      data_criacao: comment.data_criacao,
      data_alteracao: comment.data_alteracao,
      descricao: comment.descricao,
      pessoa_criado_por: comment.PESSOA,
      requisicao: comment.web_requisicao,
    };
  }

  async getMany(params) {
    params.id_requisicao = parseInt(params.id_requisicao);
    return prisma.web_comentarios_requsicao.findMany({ 
      where  : params,
      include:  this.include(),
      orderBy: { id_comentario_requisicao: "desc" },
    }).then((comments) => { 
      return comments.map((comment) => this.format(comment));
    });
  }

  async getById(id) {
    return prisma.web_comentarios_requsicao.findUnique({ where: { id }, include: this.include() }).then((comment) => this.format(comment));
  }

  async update(id_comentario_requisicao, data) {
    data.data_criacao = getNowISODate();
    data.data_alteracao = getNowISODate();
    return prisma.web_comentarios_requsicao.update({ where: { id_comentario_requisicao }, data, include: this.include() }).then((comment) => this.format(comment));
  }

  async delete(id) {
    return prisma.web_comentarios_requsicao.delete({ where: { id_comentario_requisicao: id } });
  }
}

module.exports = new  RequisitionCommentRepository();
