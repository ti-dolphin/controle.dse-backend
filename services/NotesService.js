const NotesRepository = require('../repositories/NotesRepository');

class NotesService {
  async getMany(params) {
    return NotesRepository.getMany(params);
  }
}

module.exports = new NotesService();