// controle.dse-backend/controllers/webComentariosRequsicaoController.js
const RequisitionCommentService = require("../services/RequisitionCommentService");

class RequisitionCommentController {
  async create(req, res) {
    try {
      const data = req.body;
      const result = await RequisitionCommentService.create(data);
      res.status(201).json(result);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating web comentarios requsicao" });
    }
  }

  async getMany(req, res) {
    try {
      const params = req.query;
      const result = await RequisitionCommentService.getMany(params);
      res.json(result);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error getting web comentarios requsicao" });
    }
  }

  async getById(req, res) {
    try {
      const id = req.params.id;
      const result = await RequisitionCommentService.getById(id);
      res.json(result);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error getting web comentarios requsicao by id" });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const data = req.body;
      const result = await RequisitionCommentService.update(id, data);
      res.json(result);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating web comentarios requsicao" });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      const result = await RequisitionCommentService.delete(id);
      res.json(result);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting web comentarios requsicao" });
    }
  }
}

module.exports = new  RequisitionCommentController();
