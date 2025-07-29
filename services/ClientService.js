const ClientRepository = require("../repositories/ClientRepository");

class ClientService {
   async getMany() {
    return ClientRepository.getMany();
  }

   async getById(CODCLIENTE) {
    return ClientRepository.getById(CODCLIENTE);
  }

   async create(data) {
    return ClientRepository.create(data);
  }

   async update(CODCLIENTE, data) {
    return ClientRepository.update(CODCLIENTE, data);
  }

   async delete(CODCLIENTE) {
    await ClientRepository.delete(CODCLIENTE);
  }
}
module.exports = new ClientService();
