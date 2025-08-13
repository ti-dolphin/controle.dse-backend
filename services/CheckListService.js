const { prisma } = require("../database");
var CheckListRepository = require("../repositories/CheckListRepository");
const { getNowISODate } = require("../utils");
const EmailService = require("./EmailService");
const Handlebars = require("handlebars");
const fs = require("fs");

class CheckListService {
  async create(data) {
    return CheckListRepository.create(data);
  }

  async getMany(params) {
    const {searchTerm, id_patrimonio, filters, codpessoa} = params;
    if (id_patrimonio) {
      return CheckListRepository.getMany(
        //buscar todos os que que pertencem ao patrimônio
        {
          movimentacao_patrimonio: {
            web_patrimonio: { id_patrimonio: Number(params.id_patrimonio) },
          },
        },
        filters,
        searchTerm
      );
    }
  }

  async getManyByUser(params, codpessoa) {
    const {searchTerm, filters, situacao} = params;
    return CheckListRepository.getManyByUser(
      codpessoa,
      filters,
      searchTerm,
      situacao
    );
  }

  async getById(id_checklist_movimentacao) {
    const checklist =  await CheckListRepository.getById(id_checklist_movimentacao);
    return checklist;
  }

  async verifyChecklistCreation(){ 
    //pega os checklists  finalizados a mais tempo do que a sua periodicidade
    const expiredChecklists = await CheckListRepository.getFinishedExpiredChecklists();
    const newChecklsits = [];

    for(let checklist of expiredChecklists){
      const newChecklist = await CheckListRepository.create({
        id_movimentacao: checklist.id_movimentacao,
        aprovado: false,
        realizado: false,
        data_criacao: getNowISODate(),
        observacao: `Checklist gerado automáticamente em ${getNowISODate()}`,
      });
      newChecklsits.push(newChecklist);
    }
    console.log("newChecklsits", newChecklsits.length);
    return {
      checklistsCreated: newChecklsits.length,
      errors: 0
    };
  }

  async verifyChecklistItems(){ 
      const checklistWithoutItems = await CheckListRepository.getChecklistsWithoutItems();
      const checklistsWithItemsInserted = [];
      if(checklistWithoutItems.length > 0 ) { 
          for (let checklist of checklistWithoutItems) {
            const { web_items_checklist_tipo } = checklist.patrimonio.web_tipo_patrimonio;
            for (let item_tipo of web_items_checklist_tipo) {
              const { nome_item_checklist } = item_tipo;
              await prisma.web_items_checklist_movimentacao.create({
                data: {
                  id_checklist_movimentacao: checklist.id_checklist_movimentacao,
                  nome_item_checklist: nome_item_checklist,
                },
              });
            }
            checklistsWithItemsInserted.push(checklist);
          }
          console.log("checklistsWithItemsInserted", checklistsWithItemsInserted.length);
          return checklistsWithItemsInserted;
      }
      return [];
  }

  async sendChecklistEmails(){ 
    const undoneChecklits = await CheckListRepository.getUndoneChecklists();
    let emailsSent = 0;
    for (let checklist of undoneChecklits) {
      const {responsavel, patrimonio} = checklist;
       const templateSource = fs.readFileSync(
              `./views/checklistNotification.handlebars`,
              "utf8"
            );
      const template = Handlebars.compile(templateSource);
      const html = template({
        responsavel: responsavel, //será utilizado o campo NOME
        patrimonio: patrimonio, //será utilizado o campo nome e id_patrimonio
        checklist: checklist //será utilizado o campo id_checklist_movimentacao
      })
      const emailSent = await EmailService.sendEmail(
        responsavel.EMAIL,
        `Checklist à realizar - Patrimônio ${patrimonio.id_patrimonio} - ${patrimonio.nome}`,
        html
      );
      console.log("emailSent", emailSent);
      if(emailSent){
        emailsSent++;
      }
    }
    return emailsSent;
  }

  async update(id_checklist_movimentacao, data) {
    return CheckListRepository.update(id_checklist_movimentacao, data);
  }

  async delete(id_checklist_movimentacao) {
    return CheckListRepository.delete(id_checklist_movimentacao);
  }
}

module.exports = new CheckListService();
