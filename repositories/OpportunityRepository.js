const { prisma } = require("../database");
const ProjectRepository = require("./ProjectRepository");
const UserService = require("../services/UserService");

class OpportunityRepository {
    static async getById(CODOS) {
        
        return await prisma.ordemservico.findUnique({
            where: { CODOS },
            include: { 
                projetos: true,
                cliente: { 
                    select:{ 
                        CNPJ: true, 
                        NOMEFANTASIA: true, 
                        CODCLIENTE: true, 
                        CODCOLIGADA: true
                    }
                }
            }
        }).then(opportunity => { 
            const formattedOpp = {
              ...opportunity,
              projeto: opportunity.projetos,
            };
            delete formattedOpp.projetos;
            return formattedOpp;
        });
    }

    static async getStatuses(){ 
        return await prisma.status.findMany();
    }

    static async getMany(user, searchTerm, filters, finalizados) {   
        let projectsFollowedByUser = await ProjectRepository.getProjectsFollowedByUser(user.CODPESSOA);    
        projectsFollowedByUser = projectsFollowedByUser.map(project => project.ID);
        const opps = await prisma.ordemservico
          .findMany({
            where: {
              AND: [
                { CODTIPOOS: 21 },
                { projetos: { ATIVO: 1, ID: UserService.isAdmin(user) ? {} :  { in: projectsFollowedByUser }}},
                { status: { ACAO: finalizados ? 0 : 1 } },
                {OR: [
                    { projetos: { DESCRICAO: { contains: searchTerm } } },
                    {
                      projetos: { pessoa: { NOME: { contains: searchTerm } } },
                    },
                    { status: { NOME: { contains: searchTerm } } },
                    { cliente: { NOMEFANTASIA: { contains: searchTerm } } },
                    { NOME: { contains: searchTerm } },
                    { pessoa: { NOME: { contains: searchTerm } } }]},
              ],
            },
            include: {
              projetos: {
                include: {
                  pessoa: true,
                },
              },
              pessoa: {
                select: {
                  NOME: true,
                  CODPESSOA: true,
                },
              },
              adicionais: true,
              cliente: true,
              status: true,
            },
          })
          .then((opps) =>
            opps.map((opportunity) => {
              const formattedOpp = {
                ...opportunity,
                projeto: opportunity.projetos,
                gerente: opportunity.projetos.pessoa,
                responsavel: opportunity.pessoa,
                adicional: opportunity.adicionais,
              };
              delete formattedOpp.adicionais;
              delete formattedOpp.projetos;
              delete formattedOpp.pessoa;
              return formattedOpp;
            })
          );
      opps.forEach(opportunity => {
        console.log('DATAINICIO:', opportunity.DATAINICIO);
        console.log('DATAINTERACAO:', opportunity.DATAINTERACAO);
        console.log('DATAENTREGA:', opportunity.DATAENTREGA);
      });

          return opps;
    }

    static async create(payload) {
        return await prisma.ordemservico.create({
            data: payload
        });
    }

    static async update(CODOS, payload) {
        return await prisma.ordemservico.update({
            where: { CODOS },
            data: payload
        });
    }

    static async delete(CODOS) {
        return await prisma.ordemservico.delete({
            where: { CODOS }
        });
    }

}

module.exports = OpportunityRepository;
