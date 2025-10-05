const RequisitionFileService = require('../services/RequisitionFileService');

class RequisitionFileController {
    async getMany(req, res) {
        try {
            const params = req.query;
            const files = await RequisitionFileService.getMany(params);
            res.json(files);
        } catch (error) {
            console.log("error", error)
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const file = await RequisitionFileService.getById(id);
            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }
            res.json(file);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const payload = req.body;
            const newFile = await RequisitionFileService.create(payload);
            res.status(201).json(newFile);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const payload = req.body;
            const updatedFile = await RequisitionFileService.update(id, payload);
            if (!updatedFile) {
                return res.status(404).json({ error: 'File not found' });
            }
            res.json(updatedFile);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await RequisitionFileService.delete(id);
            if (!deleted) {
                return res.status(404).json({ error: 'File not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new RequisitionFileController();