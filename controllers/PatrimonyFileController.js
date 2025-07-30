const PatrimonyFileService = require('../services/PatrimonyFIleService');

class PatrimonyFileController {
    async getMany(req, res) {
        const params = req.query;
        try {
            const files = await PatrimonyFileService.getMany(params);
            res.json(files);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getById(req, res) {
        try {
            const { id_anexo_patrimonio } = req.params;
            const file = await PatrimonyFileService.getById(
              Number(id_anexo_patrimonio)
            );
            if (!file) {
                return res.status(404).json({ error: 'Arquivo não encontrado' });
            }
            res.json(file);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async create(req, res) {
        try {
            const payload = req.body;
            const newFile = await PatrimonyFileService.create(payload);
            res.status(201).json(newFile);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async update(req, res) {
        try {
            const { id_anexo_patrimonio } = req.params;
            const payload = req.body;
            const updatedFile = await PatrimonyFileService.update(
              Number(id_anexo_patrimonio),
              payload
            );
            if (!updatedFile) {
                return res.status(404).json({ error: 'Arquivo não encontrado' });
            }
            res.json(updatedFile);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async delete(req, res) {
        try {
            const { id_anexo_patrimonio } = req.params;
            const deleted = await PatrimonyFileService.delete(
              Number(id_anexo_patrimonio)
            );
            if (!deleted) {
                return res.status(404).json({ error: 'Arquivo não encontrado' });
            }
            res.json({ message: 'Arquivo excluído com sucesso' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new PatrimonyFileController();