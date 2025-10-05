const { prisma } = require("../database");
const OpportunityRepository = require("../repositories/OpportunityRepository");
const ProjectRepository = require("../repositories/ProjectRepository");
const { getNowISODate } = require("../utils");


class OpportunityTrigger {
  static beforeCreate = async (data, tx, isAdicional) => {
    if (isAdicional) {
      const newAdicional = await this.createAdicional(
        Number(data.ID_PROJETO),
        tx
      );
      data.ID_ADICIONAL = newAdicional.ID;
      return data;
    }
    let newProject = {
      CODGERENTE: 9999,
      DESCRICAO: data.DESCRICAO,
      ATIVO: 1,
    };
    newProject = await ProjectRepository.create(newProject, tx);
    const newAdicional = await this.createAdicional(Number(newProject.ID), tx);
    data.ID_PROJETO = newProject.ID;
    data.ID_ADICIONAL = newAdicional.ID;
    return data;
  };

  static afterDelete = async (ID_ADICIONAL, tx) => {
    const adicional = await tx.aDICIONAIS.findUnique({
      where: {
        ID: ID_ADICIONAL
      },
    });
    if (adicional) {
      await tx.aDICIONAIS.delete({
        where: {
          ID: adicional.ID,
        },
      });
      console.log("adicional deleteado: ", adicional.ID);
    }
    if (adicional.NUMERO === 0) {
      await tx.projetos.delete({
        where: {
          ID: adicional.ID_PROJETO,
        },
      });
      console.log("projeto deleteado: ", adicional.ID_PROJETO);
    }
  };

  static createAdicional = async (ID_PROJETO, tx) => {
    const lastAdicional = await tx.aDICIONAIS.findFirst({
      where: {
        ID: ID_PROJETO,
      },
      orderBy: {
        ID: "desc",
      },
    });
    if (lastAdicional) {
      const { NUMERO } = lastAdicional;
      const newAdicional = await tx.aDICIONAIS.create({
        data: {
          ID_PROJETO,
          NUMERO: NUMERO + 1,
        },
      });
      return newAdicional;
    }
    const newAdicional = await tx.aDICIONAIS.create({
      data: {
        ID_PROJETO,
        NUMERO: 0,
      },
    });
    return newAdicional;
  };
}

module.exports = OpportunityTrigger
