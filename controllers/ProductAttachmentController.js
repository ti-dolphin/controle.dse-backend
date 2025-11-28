const ProductAttachmentService = require("../services/ProductAttachmentService");

class ProductAttachmentController {
  static async getByProduct(req, res) {
    console.log("getByProduct");
    try {
      const { id_produto } = req.query;
      const attachments = await ProductAttachmentService.getByProduct(
        id_produto
      );
      res.json(attachments);
    } catch (error) {
      console.error("Erro ao buscar anexos de produtos:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async getById(req, res) {
    const { id_anexo_produto } = req.params;
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
    const { arquivo, id_produto, is_produto_padrao } = req.body;
    try {
      const newAttachment = await ProductAttachmentService.create({
        arquivo,
        id_produto,
        ...(is_produto_padrao !== undefined && { is_produto_padrao }),
      });
      res.status(201).json(newAttachment);
    } catch (error) {
      console.error("Erro ao criar anexo de produto:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async update(req, res) {
    const { id_anexo_produto } = req.params;
    const { arquivo, id_produto } = req.body;
    try {
      const updatedAttachment = await ProductAttachmentService.update(id, {
        arquivo,
        id_produto,
      });
      res.json(updatedAttachment);
    } catch (error) {
      console.error("Erro ao atualizar anexo de produto:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async delete(req, res) {
    const { id_anexo_produto } = req.params;
    try {
      await ProductAttachmentService.delete(id_anexo_produto);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar anexo de produto:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
}

module.exports = ProductAttachmentController;