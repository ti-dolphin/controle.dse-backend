const NotesRepository = require('../repositories/NotesRepository');

class NotesService {
  async getMany(params) {
    return NotesRepository.getMany(params);
  }

  async getManyPonto(params) {
    return NotesRepository.getManyPonto(params);
  }
}

module.exports = new NotesService();