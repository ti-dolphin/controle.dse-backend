const RequisitionItemRepository = require('../repositories/RequisitionItemRepository');
const QuoteItemService = require('../services/QuoteItemService');

class QuoteItemController {
  async getMany(req, res) {
    try {
      const params = req.query;
      const { searchTerm } = params;
      delete params.searchTerm;
      const items = await QuoteItemService.getMany(params, searchTerm);
      res.json(items);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id_item_cotacao } = req.params;
      const item = await QuoteItemService.getById(id_item_cotacao);
      if (!item) {
        return res.status(404).json({ error: "Item não encontrado" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
        //verifica se é uma lista de ids de reqItem, se for, cria os itens a partir deles
      if (Array.isArray(req.body)) {
        //esperado um array de ids de item da requisição
       const newItems = await QuoteItemService.createMany(req.body);
       return res.status(201).json(newItems);
      }

      const newItem = await QuoteItemService.create(req.body);
      res.status(201).json(newItem);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id_item_cotacao } = req.params;
      const updatedItem = await QuoteItemService.update(
        id_item_cotacao,
        req.body
      );
      //log indisponivel
     
      if (!updatedItem) {
        return res.status(404).json({ error: "Item não encontrado" });
      }
      res.json(updatedItem);
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id_item_cotacao } = req.params;
      const deleted = await QuoteItemService.delete(id_item_cotacao);
      if (!deleted) {
        return res.status(404).json({ error: "Item não encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new QuoteItemController();