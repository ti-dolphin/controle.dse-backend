const KanbanStatusRequisitionRepository = require("../repositories/KanbanStatusRequisitionRepository");
const RequisitionRepository = require("../repositories/RequisitionRepository");
const {prisma } = require('../database');

// interface user{
//   CODPESSOA: number;
//   NOME: string;
//   LOGIN: string;
//   SENHA: string;
//   SOLICITANTE: boolean;
//   RESPONSAVEL: boolean;
//   LIDER: boolean;
//   PERM_LOGIN: boolean;
//   PERM_EPI: boolean;
//   PERM_AUTENTICACAO: boolean;
//   PERM_OS: boolean;
//   PERM_TIPO: boolean;
//   PERM_STATUS: boolean;
//   PERM_APONT: boolean;
//   PERM_STATUS_APONT: boolean;
//   PERM_PESSOAS: boolean;
//   PERM_COMENT_OS: boolean;
//   PERM_COMENT_APONT: boolean;
//   CODGERENTE: number | null;
//   ATIVO: boolean;
//   EMAIL: string;
//   PERM_PONTO: boolean;
//   PERM_VENDA: boolean;
//   PERM_CADEPI: boolean;
//   PERM_DESCONTADO: boolean;
//   PERM_GESTAO_PESSOAS: boolean | null;
//   PERM_CONTROLE_RECESSO: boolean | null;
//   PERM_CUSTO: boolean;
//   PERM_FERRAMENTAS: boolean;
//   PERM_CHECKLIST: boolean;
//   PERM_PROSPECCAO: boolean;
//   PERM_APONTAMENTO_PONTO: boolean;
//   PERM_APONTAMENTO_PONTO_JUSTIFICATIVA: boolean;
//   PERM_BANCO_HORAS: boolean;
//   PERM_FOLGA: boolean;
//   ULTIMO_LOGIN: string | null;
//   PERM_REQUISITAR: number | null;
//   PERM_COMPRADOR: number | null;
//   PERM_CADASTRAR_PAT: number | null;
//   PERM_ADMINISTRADOR: number | null;
//   PERM_COMERCIAL: number | null;
//   PERM_DIRETOR: number | null;
//   PERM_EDITAR_PRODUTOS: number | null;
// }
class RequisitionService {
  async getMany(user, params) {
    // lista de relação kanban x status x perfil
    const kanban_status_list = await KanbanStatusRequisitionRepository.getMany(params);
    const status_list = kanban_status_list.map((kanban_status) => kanban_status.id_status_requisicao);

    let status_list_by_user_profile = [];

    if(Number(user.PERM_ADMINISTRADOR) === 1){ 
      status_list_by_user_profile = status_list;
    }
    if(Number(user.PERM_COMPRADOR) === 1){ 
      status_list_by_user_profile = kanban_status_list.filter((kanban_status) => kanban_status.perfil === '2');
    };


    //determinar quais os statu que eu vou ver baeado no meu usuario e na requisição



  
   
    
  
    return await RequisitionRepository.findMany(params);
  }

  async getById(id) {
    return await RequisitionRepository.findById(id);
  }

  async create(data) {
    console.log("Creating requisition with data:", data);
    return await RequisitionRepository.create(data);
  }

  async update(id, data) {
    return await RequisitionRepository.update(id, data);
  }

  async delete(id) {
    return await RequisitionRepository.delete(id);
  }
}

module.exports = new RequisitionService();
