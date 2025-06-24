const QuoteItemService = require('../services/QuoteItemService');

class QuoteItemController {
    async getMany(req, res) {
       try {
          const params = req.query;
          const items = await QuoteItemService.getMany(params);
          res.json(items);
       } catch (error) {
          res.status(500).json({ error: error.message });
       }
    }

    async getById(req, res) {
       try {
          const { id_item_cotacao } = req.params;
          const item = await QuoteItemService.getById(id_item_cotacao);
          if (!item) {
             return res.status(404).json({ error: 'Item não encontrado' });
          }
          res.json(item);
       } catch (error) {
          res.status(500).json({ error: error.message });
       }
    }

    async create(req, res) {
       try {
          const newItem = await QuoteItemService.create(req.body);
          res.status(201).json(newItem);
       } catch (error) {
          res.status(400).json({ error: error.message });
       }
    }

    async update(req, res) {
       try {
          const { id_item_cotacao } = req.params;
          const updatedItem = await QuoteItemService.update(id_item_cotacao, req.body);
          if (!updatedItem) {
             return res.status(404).json({ error: 'Item não encontrado' });
          }
          res.json(updatedItem);
       } catch (error) {
          res.status(400).json({ error: error.message });
       }
    }

     async delete(req, res) {
       try {
          const { id_item_cotacao } = req.params;
          const deleted = await QuoteItemService.delete(id_item_cotacao);
          if (!deleted) {
             return res.status(404).json({ error: 'Item não encontrado' });
          }
          res.status(204).send();
       } catch (error) {
          res.status(500).json({ error: error.message });
       }
    }
}

module.exports = new QuoteItemController();