const MovementationRepository = require("../repositories/MovementationRepository");


class MovementationService {

    async create(payload) {
        return await MovementationRepository.create(payload);
    }

    async getMany(params) {
        return await MovementationRepository.getMany(params);
    }

    async getById(id_movimentacao) {
        return await MovementationRepository.getById(id_movimentacao);
    }

    async update(id_movimentacao, payload) {
        return await MovementationRepository.update(id_movimentacao, payload);
    }

    async delete(id_movimentacao) {
        return await MovementationRepository.delete(id_movimentacao);
    }
}
module.exports = new MovementationService();
