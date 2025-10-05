const OpportunityCommentService = require("../services/OpportunityCommentService");

class OpportunityCommentController {
  async getMany(req, res) {
    
    try {
      const { CODOS } = req.query;
      const opportunityComments = await OpportunityCommentService.getMany(Number(CODOS));
      ;
      res.json(opportunityComments);
    } catch (error) {
      ;
      res.status(500).json({ message: "Erro ao buscar comentários da oportunidade" });
    }
  }

  async getById(req, res) {
    try {
      const {CODCOMENTARIO} = req.params;
      const opportunityComment = await OpportunityCommentService.getById(
        parseInt(CODCOMENTARIO)
      );
      if (!opportunityComment)
        return res.status(404).json({ message: "Comentário da oportunidade não encontrado" });
      res.json(opportunityComment);
    } catch (error) {
      ;
      res.status(500).json({ message: "Erro ao buscar comentário da oportunidade" });
    }
  }

  async create(req, res) {
    try {
      const opportunityComment = await OpportunityCommentService.create(
        req.body
      );
      res.status(201).json(opportunityComment);
    } catch (error) {
      console.log("error create comentário os: ", error)
      res.status(500).json({ message: "Erro ao criar comentário da oportunidade" });
    }
  }

  async update(req, res) {
    try {
       const {CODCOMENTARIO} = req.params;
      const opportunityComment = await OpportunityCommentService.update(
        parseInt(CODCOMENTARIO),
        req.body
      );
      if (!opportunityComment)
        return res.status(404).json({ message: "Comentário da oportunidade não encontrado" });
      res.json(opportunityComment);
    } catch (error) {
      ;
      res.status(500).json({ message: "Erro ao atualizar comentário da oportunidade" });
    }
  }

  async delete(req, res) {
    try {
      const {CODCOMENTARIO} = req.params;
      await OpportunityCommentService.delete(parseInt(CODCOMENTARIO));
      res.json({ message: "Comentário da oportunidade deletado" });
    } catch (error) {
      ;
      res.status(500).json({ message: "Erro ao deletar comentário da oportunidade" });
    }
  }
}

module.exports = new OpportunityCommentController();

