const { prisma } = require("../database");
const OpportunityRepository = require("../repositories/OpportunityRepository");
const ProjectRepository = require("../repositories/ProjectRepository");
const fs = require("fs");
const Handlebars = require("handlebars");
const EmailService = require("../services/EmailService");
const OpportunityTrigger = require("../triggers/OpportunityTrigger");
const OpportunityView = require("../views/OpportunityViews");

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

  async update(CODOS, data, user) {
    // if (data.VALORFATDOLPHIN && data.VALORFATDIRETO && data.VALOR_COMISSAO){
    data.VALORFATDOLPHIN =
      data.VALORFATDOLPHIN !== "" ? data.VALORFATDOLPHIN : 0;
    data.VALORFATDIRETO = data.VALORFATDIRETO !== "" ? data.VALORFATDIRETO : 0;
    data.VALOR_COMISSAO = data.VALOR_COMISSAO !== "" ? data.VALOR_COMISSAO : 0;
    // }
    try {
      const updatedOpportunity = await OpportunityRepository.update(CODOS, data);
      // Verifica se não houve erro antes de enviar o email de ganho
      if (updatedOpportunity && !updatedOpportunity.error) {
        if (updatedOpportunity.status.CODSTATUS === 11) {
          //VALIDAR SE JÁ NÃO FOI ENVIADO O E-MAIL ANTERIORMENTE
          await this.sendSoldOpportunityEmail(CODOS, data, user);
        } 
      }
      return updatedOpportunity;
    } catch (e) {
      throw e;
    }
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

  async sendSoldOpportunityEmail (
    CODOS,
    data,
    user
  ) {
    // Busca dados necessários do banco
    const os = await prisma.oRDEMSERVICO.findFirst({
      where: { CODOS },
      select: {
        ID_PROJETO: true,
        ID_ADICIONAL: true,
        NOME: true,
        VALORFATDIRETO: true,
        VALORFATDOLPHIN: true,
        FK_CODCLIENTE: true,
        EMAIL_VENDA_ENVIADO: true,
        DESCRICAO_VENDA: true,
      },
    });
    console.log(os.EMAIL_VENDA_ENVIADO, 'EMAIL_VENDA_ENVIADO')
    
    if (os.EMAIL_VENDA_ENVIADO) {
      return;
    }

    const adicional = await prisma.aDICIONAIS.findFirst({
      where: { ID: os.ID_ADICIONAL },
      select: { NUMERO: true },
    });

    const client = await prisma.cLIENTE.findFirst({
      where: { CODCLIENTE: os.FK_CODCLIENTE },
      select: { NOMEFANTASIA: true, },
    });

    // Monta o objeto conforme OpportunityView espera
    const opportunity = {
      idProjeto: os.ID_PROJETO,
      isAdicional: adicional.NUMERO > 0 ? true : false,
      numeroAdicional: adicional?.NUMERO ?? 0,
      nome: os.NOME,
      valorFatDireto: os.VALORFATDIRETO,
      valorFatDolphin: os.VALORFATDOLPHIN,
      descricaoVenda: os.DESCRICAO_VENDA,
    };

    const clientName = client?.NOMEFANTASIA || "N/A";

    const htmlContent = OpportunityView.createSoldOppEmail(
      opportunity,
      user,
      clientName
    );
    try {
      let emailSent = false;
      
      if (opportunity.isAdicional) {
        //cliente   //projeto.adicional
        await EmailService.sendEmail(
          "leorocha2004@gmail.com",
          `Adicional Vendido: ${clientName} - ${opportunity.idProjeto}.${opportunity.numeroAdicional} - ${opportunity.nome}`,
          htmlContent,
          ["ti.dse01@dse.com.br"]
        );
      }
      if (!opportunity.isAdicional) {
        await EmailService.sendEmail(
          "leorocha2004@gmail.com",
          `Projeto Vendido: ${clientName} - ${opportunity.idProjeto}.${opportunity.numeroAdicional} - ${opportunity.nome}`,
          htmlContent,
          ["ti.dse01@dse.com.br"]
        );
      }

      if (emailSent) {
        await prisma.oRDEMSERVICO.update({
          where: { CODOS },
          data: { EMAIL_VENDA_ENVIADO: true }
        });
      }
    } catch (e) {
      console.error('Erro ao enviar e-mail de venda:', e);
      throw new Error(e);
    }
    return;
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
