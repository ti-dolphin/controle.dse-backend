const {prisma} = require("../database");


class ClientRepository {
   async getMany() {
    return prisma.cliente.findMany();
  }

   async getById(CODCLIENTE) {
    return prisma.cliente.findUnique({
      where: {
        CODCLIENTE
      },
    });
  }

   async create(data) {
    return prisma.cliente.create({
      data,
    });
  }

   async update(CODCLIENTE, data) {
    return prisma.cliente.update({
      where: {
        CODCLIENTE,
      },
      data,
    });
  }

   async delete(CODCLIENTE) {
    await prisma.cliente.delete({
      where: {
        CODCLIENTE,
      },
    });
  }
}
module.exports = new ClientRepository();