const NotesRepository = require('../repositories/NotesRepository');

class NotesService {
  async getMany(params) {
    return NotesRepository.getMany(params);
  }

  async getManyPonto(params) {
    return NotesRepository.getManyPonto(params);
  }

  async getManyProblema(params) {
    return NotesRepository.getManyProblema(params);
  }

  async getCentroCustos(ativos) {
    return NotesRepository.getCentroCustos(ativos);
  }

  async getStatusApontamento() {
    return NotesRepository.getStatusApontamento();
  }

  async getLideres() {
    return NotesRepository.getLideres();
  }

  async updateBatch(codaponts, data) {
    return NotesRepository.updateBatch(codaponts, data);
  }
}

module.exports = new NotesService();