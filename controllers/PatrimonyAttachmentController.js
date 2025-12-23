const PatrimonyAttachmentService = require("../services/PatrimonyAttachmentService");

class PatrimonyAttachmentController {
  async create(req, res) {
    try {
      const payload = req.body;
      const attachment = await PatrimonyAttachmentService.create(payload);
      res.status(201).json(attachment);
    } catch (error) {
      res.status(500).json({ 
        mensagem: "Erro ao criar anexo", 
        erro: error.message 
      });
    }
  }

  async getMany(req, res) {
    try {
      const { id_patrimonio } = req.params;
      const attachments = await PatrimonyAttachmentService.getMany(id_patrimonio);
      res.status(200).json(attachments);
    } catch (error) {
      res.status(500).json({ 
        mensagem: "Erro ao buscar anexos", 
        erro: error.message 
      });
    }
  }

  async getById(req, res) {
    try {
      const { id_anexo_patrimonio } = req.params;
      const attachment = await PatrimonyAttachmentService.getById(id_anexo_patrimonio);
      if (!attachment) {
        return res.status(404).json({ mensagem: "Anexo não encontrado" });
      }
      res.status(200).json(attachment);
    } catch (error) {
      res.status(500).json({ 
        mensagem: "Erro ao buscar anexo", 
        erro: error.message 
      });
    }
  }

  async delete(req, res) {
    try {
      const { id_anexo_patrimonio } = req.params;
      await PatrimonyAttachmentService.delete(id_anexo_patrimonio);
      res.status(204).send();
    } catch (error) {
      if (error.message === "Anexo não encontrado") {
        return res.status(404).json({ mensagem: error.message });
      }
      res.status(500).json({ 
        mensagem: "Erro ao deletar anexo", 
        erro: error.message 
      });
    }
  }
}

module.exports = new PatrimonyAttachmentController();
