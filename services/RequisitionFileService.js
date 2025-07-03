const requisitionFilesRepository = require('../repositories/RequisitionFileRepository');
const { getNowISODate } = require('../utils');

class RequisitionFilesService {
     async getMany(params) {
        return await requisitionFilesRepository.getMany(params);
    }

     async getById(id) {
        return await requisitionFilesRepository.getById(id);
    }

     async create(payload) {
        const normalizedData = { 
            ...payload,
            criado_em : getNowISODate()
        };
        delete normalizedData.id;
        return await requisitionFilesRepository.create(normalizedData);
    }

     async update(id, payload) {
        return await requisitionFilesRepository.update(id, payload);
    }

     async delete(id) {
        return await requisitionFilesRepository.delete(id);
    }
}

module.exports = new RequisitionFilesService();
