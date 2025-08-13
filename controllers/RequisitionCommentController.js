// controle.dse-backend/controllers/webComentariosRequsicaoController.js
const RequisitionCommentService = require("../services/RequisitionCommentService");

class RequisitionCommentController {
  async create(req, res) {
    try {
      const data = req.body;
      const result = await RequisitionCommentService.create(data);
      res.status(201).json(result);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Erro ao criar comentário de requisição" });
    }
  }

  async getMany(req, res) {
    try {
      const params = req.query;
      const result = await RequisitionCommentService.getMany(params);
      res.json(result);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Erro ao buscar comentários de requisição" });
    }
  }

  async getById(req, res) {
    try {
      const id = req.params.id;
      const result = await RequisitionCommentService.getById(id);
      res.json(result);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Erro ao buscar comentário de requisição por id" });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const data = req.body;
      const result = await RequisitionCommentService.update(id, data);
      res.json(result);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Erro ao atualizar comentário de requisição" });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      const result = await RequisitionCommentService.delete(id);
      res.json(result);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Erro ao deletar comentário de requisição" });
    }
  }
}

module.exports = new RequisitionCommentController();

