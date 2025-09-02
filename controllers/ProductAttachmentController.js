const ProductAttachmentService = require("../services/ProductAttachmentService");

class ProductAttachmentController {
  static async getAll(req, res) {
    try {
      const attachments = await ProductAttachmentService.getAll();
      res.json(attachments);
    } catch (error) {
      console.error("Erro ao buscar anexos de produtos:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async getById(req, res) {
    const { id } = req.params;
    try {
      const attachment = await ProductAttachmentService.getById(id);
      if (!attachment) {
        return res.status(404).json({ error: "Anexo não encontrado" });
      }
      res.json(attachment);
    } catch (error) {
      console.error("Erro ao buscar anexo de produto:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async create(req, res) {
    const { arquivo, id_produto } = req.body;
    try {
      const newAttachment = await ProductAttachmentService.create({ arquivo, id_produto });
      res.status(201).json(newAttachment);
    } catch (error) {
      console.error("Erro ao criar anexo de produto:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const { arquivo, id_produto } = req.body;
    try {
      const updatedAttachment = await ProductAttachmentService.update(id, { arquivo, id_produto });
      res.json(updatedAttachment);
    } catch (error) {
      console.error("Erro ao atualizar anexo de produto:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;
    try {
      await ProductAttachmentService.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar anexo de produto:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
}

module.exports = ProductAttachmentController;