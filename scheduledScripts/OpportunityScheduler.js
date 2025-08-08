const OpportunityService = require('../services/OpportunityService');
const {prisma} = require("../database");
const { getNowISODate } = require('../utils');

class OpportunityScheduler{ 
    static startOpportunitiesVerification = () => {
        const oneHourInMilliseconds = 1 * 60 * 60 * 1000;
        const day = 24 * oneHourInMilliseconds;
        const interval = 7 * day;
        setInterval(async () => {
            try {
                const verificationWasSuccessful = await OpportunityService.verifyOpps();
                if (verificationWasSuccessful) {
                    await prisma.web_verificao_ordemservico_logs.create({
                        data: { 
                            sucesso: 1,
                            erro: 0,
                            data_verificacao: getNowISODate()
                        }
                    });
                    return;
                }
                await prisma.web_verificao_ordemservico_logs.create({
                    data: { 
                        sucesso: 0,
                        erro: 1,
                        data_verificacao: getNowISODate()
                    }
                });
            } catch (e) {
                console.error("Erro ao verificar oportunidades", e);
            }
        }, interval);
    }
}
module.exports = OpportunityScheduler