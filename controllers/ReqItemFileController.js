const ReqItemFileService = require("../services/ReqItemFileService");

class ReqItemFileController {
     async getByRequisitionItem(req, res) {
        try {
            const {id_item_requisicao} = req.params;
            const files = await ReqItemFileService.getByRequisitionItem(
              id_item_requisicao
            );
            res.json(files);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

     async getById(req, res) {
        try {
            const file = await ReqItemFileService.getById(
              Number(req.params.id)
            );
            if (!file) {
                return res.status(404).json({ error: "File not found" });
            }
            res.json(file);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async create(req, res) {
        try {
            const payload = req.body;
            const newFile = await ReqItemFileService.create(payload);
            res.status(201).json(newFile);
        } catch (err) {
            console.log("Error creating file:", err);
            res.status(400).json({ error: err.message });
        }
    }

     async update(req, res) {
        try {
            const payload = req.body;
            const updatedFile = await ReqItemFileService.update(
              Number(req.params.id),
                payload
            );
            if (!updatedFile) {
                return res.status(404).json({ error: "File not found" });
            }
            res.json(updatedFile);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

     async delete(req, res) {
        try {
            const deleted = await ReqItemFileService.delete(
              Number(req.params.id_anexo_item_requisicao)
            );
            if (!deleted) {
                return res.status(404).json({ error: "File not found" });
            }
            res.json({ message: "File deleted successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
  
}

module.exports = new ReqItemFileController();