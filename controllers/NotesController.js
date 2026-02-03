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
}

module.exports = new NotesController();