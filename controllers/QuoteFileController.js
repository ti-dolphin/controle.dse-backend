//QuoteFileController

const QuoteFileService = require('../services/QuoteFileService');

class QuoteFileController {
    async getMany(req, res) {
        try {
            //params
            const params = req.query;
            const quoteFiles = await QuoteFileService.getMany(params);
            res.status(200).json(quoteFiles);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async getById(req, res) {
        try {
            const { id_anexo_cotacao } = req.params;
            const quoteFile = await QuoteFileService.getById(
              Number(id_anexo_cotacao)
            );
            if (!quoteFile) {
                return res.status(404).json({ mensagem: 'Arquivo de cotação não encontrado' });
            }
            res.status(200).json(quoteFile);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async create(req, res) {
        try {
            const payload = req.body;
            const newQuoteFile = await QuoteFileService.create(payload);
            res.status(201).json(newQuoteFile);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async update(req, res) {
        try {
            const { id_anexo_cotacao } = req.params;
            const payload = req.body;
            const updatedQuoteFile = await QuoteFileService.update(
              Number(id_anexo_cotacao),
              payload
            );
            if (!updatedQuoteFile) {
                return res.status(404).json({ mensagem: 'Arquivo de cotação não encontrado' });
            }
            res.status(200).json(updatedQuoteFile);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

     async delete(req, res) {
        try {
            const { id_anexo_cotacao } = req.params;
            const deleted = await QuoteFileService.delete(
              Number(id_anexo_cotacao)
            );
            if (!deleted) {
                return res.status(404).json({ mensagem: 'Arquivo de cotação não encontrado' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }
}

module.exports = new QuoteFileController();