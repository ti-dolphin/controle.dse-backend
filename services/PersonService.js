const {prisma} = require("../database");

class PersonService {
  static async getAllManagers() {
    console.log("getAllManagers");
    try {
      const activeManagerCodes = await prisma.ordemservico.findMany({
        where: { 
          projetos: {
            ATIVO: 1,
            CODGERENTE: {
              not: null,
            }
          },
        },
        select: { 
          projetos: {
            select: {
              CODGERENTE: true,
            },
          }
        }
      }).then((results) => results.map((result) => result.projetos.CODGERENTE));
      const managers = await prisma.pessoa.findMany({
        where: {
          CODGERENTE: {
            in: activeManagerCodes,
          },
        },
        select: { 
          NOME: true,
          CODPESSOA: true,
          CODGERENTE: true
        }
      });
       return managers;
    } catch (e) {
      console.log('ERRO AO PEGAR GERENTES: ', e.message)
      throw new Error(e);
    }
  }

  static async getClients(projectId) {
    try {
      if (Number(projectId) !== 0) {
        const clients = await prisma.cliente.findMany({
          where: {
            ordemservico: {
              some: {
                ID_PROJETO: Number(projectId),
                adicionais: {
                  NUMERO: 0,
                },
              },
            },
          },
          select: {
            CODCLIENTE: true,
            NOMEFANTASIA: true,
            CODCOLIGADA: true,
          },
        });
        return clients;
      } else {
        const clients = await prisma.cliente.findMany({
          where: {
            ordemservico: {
              some: {
                projetos: {
                  ATIVO: 1,
                },
              },
            },
          },
          select: {
            CODCLIENTE: true,
            NOMEFANTASIA: true,
          },
        });
        return clients;
      }
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static async getSallers(projectId) {
    try {
      if (Number(projectId)) {
        const sellers = await prisma.pessoa.findMany({
          where: {
            ordemservico: {
              some: {
                ID_PROJETO: Number(projectId),
                adicionais: {
                  NUMERO: 0,
                },
              },
            },
          },
          select: {
            NOME: true,
            CODPESSOA: true,
          },
        });
        return sellers;
      } else {
        const sellers = await prisma.pessoa.findMany({
          where: {
            PERM_COMERCIAL: 1,
          },
          select: {
            NOME: true,
            CODPESSOA: true,
          },
        });
        return sellers;
      }
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static async getAllPersons() {
    try {
      const persons = await prisma.pessoa.findMany({
        where: {
          ATIVO: true,
        },
        select: {
          NOME: true,
          CODPESSOA: true,
        },
      });
      return persons;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  static async getPersonByID(id) {
    try {
      const person = await prisma.pessoa.findMany({
        where: {
          CODPESSOA: Number(id),
        },
        select: {
          NOME: true,
          CODPESSOA: true,
        },
      });
      return person;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

module.exports = PersonService;
