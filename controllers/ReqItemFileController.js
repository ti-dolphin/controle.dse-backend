const ReqItemFileService = require("../services/ReqItemFileService");

class ReqItemFileController {
     async getMany(req, res) {
        try {
            const params = req.query;
            const files = await ReqItemFileService.getMany(params);
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
              Number(req.params.id)
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