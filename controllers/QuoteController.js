const QuoteService = require("../services/QuoteService");

class QuoteController {

     async getMany(req, res) {
        try {
            const params = req.query;
            const quotes = await QuoteService.getMany(params);
            res.json(quotes);
        } catch (err) {
            res.status(500).json({ error: "Erro interno do servidor." });
        }
    }

     async getById(req, res) {
        try {
            const quote = await QuoteService.getById(
              Number(req.params.id_cotacao)
            );
            if (!quote) {
                return res.status(404).json({ error: "Cotação não encontrada." });
            }
            res.json(quote);
        } catch (err) {
            console.log(err)
            res.status(500).json({ error: "Erro interno do servidor." });
        }
    }
    async getTaxClassifications(req, res) {
        try {
            const taxClassifications = await QuoteService.getTaxClassifications();
            res.json(taxClassifications);
        } catch (err) {
            console.log(err)
            res.status(500).json({ error: "Erro interno do servidor." });
        }
    }

     async getPaymentConditions(req, res) {
        try {
            const paymentConditions = await QuoteService.getPaymentConditions();
            res.json(paymentConditions);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Erro interno do servidor." });
        }
    }

    async getShipmentTypes(req, res) {
        try {
            const shipmentTypes = await QuoteService.getShipmentTypes();
            res.json(shipmentTypes);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Erro interno do servidor." });
        }
    }

     async create(req, res) {
        try {
            const newQuote = await QuoteService.create(req.body);
            res.status(201).json(newQuote);
        } catch (err) {
            console.log(err);
            res.status(400).json({ error: "Erro ao criar cotação: " + err.message });
        }
    }

     async update(req, res) {
        try {
            const updatedQuote = await QuoteService.update(
              Number(req.params.id_cotacao),
              req.body
            );
            if (!updatedQuote) {
                return res.status(404).json({ error: "Cotação não encontrada." });
            }
            res.json(updatedQuote);
        } catch (err) {
            console.log(err);
            res.status(400).json({ error: "Erro ao atualizar cotação: " + err.message });
        }
    }

     async delete(req, res) {
        try {
            const deleted = await QuoteService.delete(
              Number(req.params.id_cotacao)
            );
            if (!deleted) {
                return res.status(404).json({ error: "Cotação não encontrada." });
            }
            res.json({ message: "Cotação excluída com sucesso." });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Erro interno do servidor: " + err.message });
        }
    }
}

module.exports = new  QuoteController();
