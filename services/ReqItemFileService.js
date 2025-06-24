const ReqItemFileRepository = require('../repositories/ReqItemFileRepository');

class ReqItemFileService  {
    async getMany(params) {
        return ReqItemFileRepository.getMany(params);
    }

    async getById(id) {
        return ReqItemFileRepository.getById(id);
    }

    async create(payload) {
        return ReqItemFileRepository.create(payload);
    }

    async update(id, payload) {
        return ReqItemFileRepository.update(id, payload);
    }

    async delete(id) {
        return ReqItemFileRepository.delete(id);
    }
};

module.exports = new ReqItemFileService();