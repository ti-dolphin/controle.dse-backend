const PatrimonyService = require("../services/PatrimonyService");

class PatrimonyController {
  async create(req, res) {
    try {
      const payload = req.body;
      const patrimony = await PatrimonyService.create(payload);
      res.status(201).json(patrimony);
    } catch (error) {
      
      res.status(500).json({ mensagem: "Erro ao criar patrimônio", erro: error.message });
    }
  }

  async getMany(req, res) {
    try {
      const params = req.query;
      const patrimonios = await PatrimonyService.getMany();
      res.status(200).json(patrimonios);
    } catch (error) {
      res.status(500).json({ mensagem: "Erro ao buscar patrimônios", erro: error.message });
    }
  }

  async getById(req, res) {
    try {
      const patrimony = await PatrimonyService.getById(req.params.id_patrimonio);
      if (!patrimony) {
        return res.status(404).json({ mensagem: "Patrimônio não encontrado" });
      }
      res.status(200).json(patrimony);
    } catch (error) {
      res.status(500).json({ mensagem: "Erro ao buscar patrimônio", erro: error.message });
    }
  }

  async getTypes(req, res){
    try {
      const types = await PatrimonyService.getTypes();
      res.status(200).json(types);
    } catch (error) {
      res.status(500).json({ mensagem: "Erro ao buscar tipos de patrimônios", erro: error.message });
    }
}

  async update(req, res) {
    try {
      const updated = await PatrimonyService.update(
        req.params.id_patrimonio,
        req.body
      );
      if (!updated) {
        return res.status(404).json({ mensagem: "Patrimônio não encontrado" });
      }
      res.status(200).json(updated);
    } catch (error) {
      
      res.status(500).json({ mensagem: "Erro ao atualizar patrimônio", erro: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await PatrimonyService.delete(req.params.id_patrimonio);
      if (!deleted) {
        return res.status(404).json({ mensagem: "Patrimônio não encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ mensagem: "Erro ao deletar patrimônio", erro: error.message });
    }
  }
}
module.exports = new PatrimonyController();
