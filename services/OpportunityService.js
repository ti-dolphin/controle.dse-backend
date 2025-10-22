const { prisma } = require("../database");
const OpportunityRepository = require("../repositories/OpportunityRepository");
const ProjectRepository = require("../repositories/ProjectRepository");
const fs = require("fs");
const Handlebars = require("handlebars");
const EmailService = require("../services/EmailService");
const OpportunityTrigger = require("../triggers/OpportunityTrigger");
class OpportunityService {
  async getById(CODOS) {
    //código da oportunindade
    return await OpportunityRepository.getById(CODOS);
  }

  async getMany(params) {
    const { user, searchTerm, filters, finalizados } = params;
    const {
      opps,
      total,
      totalFatDolphin,
      totalFatDireto,
    } = await OpportunityRepository.getMany(
      user,
      searchTerm,
      filters,
      finalizados === 'true' ? true : false
    );
    return { opps, total, totalFatDolphin, totalFatDireto };
  }

  async getStatuses() {
    return await OpportunityRepository.getStatuses();
  }

  async create(data, isAdicional) {
    data.FK_CODCLIENTE = String(data.FK_CODCLIENTE);
    return await prisma.$transaction(async (tx) => {
      const processedData = await OpportunityTrigger.beforeCreate(data, tx, isAdicional);
      return await OpportunityRepository.create(processedData, tx);
    });
  }

  

  async update(CODOS, data) {
    // if (data.VALORFATDOLPHIN && data.VALORFATDIRETO && data.VALOR_COMISSAO){
    data.VALORFATDOLPHIN =
      data.VALORFATDOLPHIN !== "" ? data.VALORFATDOLPHIN : 0;
    data.VALORFATDIRETO = data.VALORFATDIRETO !== "" ? data.VALORFATDIRETO : 0;
    data.VALOR_COMISSAO = data.VALOR_COMISSAO !== "" ? data.VALOR_COMISSAO : 0;
    // }
    return await OpportunityRepository.update(CODOS, data);
  }

  async delete(CODOS) {
    return await prisma.$transaction(async (tx) => {
      const opp = await tx.oRDEMSERVICO.findUnique({
        where: {
          CODOS,
        },
      })
      await OpportunityRepository.delete(CODOS, tx);
      await OpportunityTrigger.afterDelete(opp.ID_ADICIONAL, tx);
      return true;
    });
  }

  normalizeFilters(filtersArray) {
    if (filtersArray) {
      const intFields = ["CODOS", "ID_PROJETO", "VALOR_TOTAL"];
      return filtersArray.map((filter) => {
        // Só há uma chave por objeto
        const [field, value] = Object.entries(filter)[0];
        // Se for campo numérico, converte todos os valores possíveis para número
        if (intFields.includes(field)) {
          // Exemplo: { equals: "88" } => { equals: 88 }
          const newValue = {};
          for (const op in value) {
            if (typeof value[op] === "string" && !isNaN(value[op])) {
              newValue[op] = Number(value[op]);
            } else {
              newValue[op] = value[op];
            }
          }
          return { [field]: newValue };
        }

        // Para campos aninhados, verifica recursivamente
        function deepNormalize(obj) {
          if (typeof obj !== "object" || obj === null) return obj;
          const result = Array.isArray(obj) ? [] : {};
          for (const k in obj) {
            if (typeof obj[k] === "string" && !isNaN(obj[k])) {
              result[k] = Number(obj[k]);
            } else if (typeof obj[k] === "object") {
              result[k] = deepNormalize(obj[k]);
            } else {
              result[k] = obj[k];
            }
          }
          return result;
        }

        return { [field]: deepNormalize(value) };
      });
    }
    return [];
  }


  async verifyOpps() {
    try {
      const oppsByResponsable = await this.getOppsByResponsable();
      if (oppsByResponsable) {
        const reportSent = await this.sendWeeklyReport(oppsByResponsable);
        console.log("reportSent: ", reportSent);
        return reportSent;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  async sendWeeklyReport(oppsByResponsable) {

    let succesfullEmails = 0
    let failedEmails = 0
    try {
      const templateSource = fs.readFileSync(
        `./views/opportunityReport.handlebars`,
        "utf8"
      );
      const template = Handlebars.compile(templateSource);
      for (let CODPESSOA of oppsByResponsable.keys()) {
        //expired and toExpire lengt
        const html = template({
          expired: oppsByResponsable.get(CODPESSOA).expired,
          toExpire: oppsByResponsable.get(CODPESSOA).toExpire,
          nome_responsavel: oppsByResponsable.get(CODPESSOA).responsavel.NOME,
        });

        const sent = await EmailService.sendEmail(
          [oppsByResponsable.get(CODPESSOA).responsavel.EMAIL],
          "Relatório Semanal de Oportunidades",
          html
        );

        if (sent) {
          succesfullEmails += 1;
          const successEmailLog = await prisma.web_email_logs.create({
            data: {
              id_destinatario: parseInt(
                oppsByResponsable.get(CODPESSOA).responsavel.CODPESSOA
              ),
              assunto: "Relatório Semanal de Oportunidades",
              sucesso: 1,
              erro: 0,
            },
          });
        }else {
          failedEmails += 1;
           const successEmailLog = await prisma.web_email_logs.create({
             data: {
               id_destinatario: parseInt(
                 oppsByResponsable.get(CODPESSOA).responsavel.CODPESSOA
               ),
               assunto: "Relatório Semanal de Oportunidades",
               sucesso: 0,
               erro: 1,
             },
           });
        }
      }

      return {succesfullEmails, failedEmails};
    } catch (e) {
      return false;
    }
  }

  async getOppsByResponsable() {
    try {
      const expiredOpps = await OpportunityRepository.getExpiredOpps();
      const toExpireOpps = await OpportunityRepository.getToExpireOpps();
      if (!(expiredOpps.length > 0) && !(toExpireOpps.length > 0)) return null;
      const oppsByResponsable = new Map();
      expiredOpps.forEach((opp) => {
        if (oppsByResponsable.has(opp.responsavel.CODPESSOA)) {
          oppsByResponsable.get(opp.responsavel.CODPESSOA).expired.push(opp);
        } else {
          oppsByResponsable.set(opp.responsavel.CODPESSOA, {
            responsavel: opp.responsavel,
            expired: [opp],
            toExpire: [],
          });
        }
      });

      toExpireOpps.forEach((opp) => {
        if (oppsByResponsable.has(opp.responsavel.CODPESSOA)) {
          oppsByResponsable.get(opp.responsavel.CODPESSOA).toExpire.push(opp);
        } else {
          oppsByResponsable.set(opp.responsavel.CODPESSOA, {
            responsavel: opp.responsavel,
            expired: [],
            toExpire: [opp],
          });
        }
      });
      return oppsByResponsable;
    } catch (e) {
      return null;
    }
  }
}

module.exports = new OpportunityService();
