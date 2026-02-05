const NotesService = require('../services/NotesService');

class NotesController {
  async getMany(req, res) {
    try {
      const notes = await NotesService.getMany(req.query);
      res.json(notes);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getManyPonto(req, res) {
    try {
      const pontos = await NotesService.getManyPonto(req.query);
      res.json(pontos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getManyProblema(req, res) {
    try {
      const problemas = await NotesService.getManyProblema(req.query);
      res.json(problemas);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCentroCustos(req, res) {
    try {
      const ativos = req.query.ativos !== 'false';
      const centroCustos = await NotesService.getCentroCustos(ativos);
      res.json(centroCustos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getStatusApontamento(req, res) {
    try {
      const statuses = await NotesService.getStatusApontamento();
      res.json(statuses);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLideres(req, res) {
    try {
      const lideres = await NotesService.getLideres();
      res.json(lideres);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateBatch(req, res) {
    try {
      const { codaponts, ...data } = req.body;
      if (!codaponts || !Array.isArray(codaponts) || codaponts.length === 0) {
        return res.status(400).json({ error: 'codaponts é obrigatório e deve ser um array' });
      }
      const result = await NotesService.updateBatch(codaponts, data);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new NotesController();