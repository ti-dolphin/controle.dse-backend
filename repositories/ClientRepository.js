const {prisma} = require("../database");


class ClientRepository {
  async getMany() {
    return prisma.cLIENTE.findMany();
  }

  async getById(CODCLIENTE) {
    return prisma.cLIENTE.findUnique({
      where: {
        CODCLIENTE
      },
    });
  }

  async create(data) {
    return prisma.cLIENTE.create({
      data,
    });
  }

  async update(CODCLIENTE, data) {
    return prisma.cLIENTE.update({
      where: {
        CODCLIENTE,
      },
      data,
    });
  }

  async delete(CODCLIENTE) {
    await prisma.cLIENTE.delete({
      where: {
        CODCLIENTE,
      },
    });
  }
}
module.exports = new ClientRepository();