const OpportunityAttachmentService = require("../services/OpportunityAttachmentService");

class OpportunityAttachmentController {
    async getMany(req, res) {
        try {
            const {CODOS} = req.query;
            const attachments = await OpportunityAttachmentService.getMany(
              Number(CODOS)
            );
            res.json(attachments);
        } catch (error) {
            ;
            res.status(500).json({ message: "Erro ao buscar anexos da oportunidade" });
        }
    }

    async getById(req, res) {
        try {
            const { id_anexo_os } = req.params;
            const attachment = await OpportunityAttachmentService.getById(
              Number(id_anexo_os)
            );
            if (!attachment) {
                return res.status(404).json({ message: "Anexo não encontrado" });
            }
            res.json(attachment);
        } catch (error) {
            ;
            res.status(500).json({ message: "Erro ao buscar anexo da oportunidade" });
        }
    }

    async create(req, res) {
        ;
        try {
          
            const attachment = await OpportunityAttachmentService.create(req.body);
            res.status(201).json(attachment);
        } catch (error) {
            ;
            res.status(500).json({ message: "Erro ao criar anexo da oportunidade" });
        }
    }

    async update(req, res) {
        try {
            const { id_anexo_os } = req.params;
            const updatedAttachment = await OpportunityAttachmentService.update(
              Number(id_anexo_os),
              req.body
            );
            if (!updatedAttachment) {
                return res.status(404).json({ message: "Anexo não encontrado" });
            }
            res.json(updatedAttachment);
        } catch (error) {
            ;
            res.status(500).json({ message: "Erro ao atualizar anexo da oportunidade" });
        }
    }

    async delete(req, res) {
        try {
            const { id_anexo_os } = req.params;
            ;
            const deleted = await OpportunityAttachmentService.delete(
              Number(id_anexo_os)
            );
            if (!deleted) {
                return res.status(404).json({ message: "Anexo não encontrado" });
            }
            res.status(204).end();
        } catch (error) {
            ;
            res.status(500).json({ message: "Erro ao deletar anexo da oportunidade" });
        }
    }
}

module.exports = new OpportunityAttachmentController();

