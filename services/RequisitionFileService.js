const requisitionFilesRepository = require('../repositories/RequisitionFileRepository');

class RequisitionFilesService {
     async getMany(params) {
        return await requisitionFilesRepository.getMany(params);
    }

     async getById(id) {
        return await requisitionFilesRepository.getById(id);
    }

     async create(payload) {
        return await requisitionFilesRepository.create(payload);
    }

     async update(id, payload) {
        return await requisitionFilesRepository.update(id, payload);
    }

     async delete(id) {
        return await requisitionFilesRepository.delete(id);
    }
}

module.exports = new RequisitionFilesService();
