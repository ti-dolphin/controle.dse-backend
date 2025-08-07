var CheckListRepository = require("../repositories/CheckListRepository");

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

  async update(id_checklist_movimentacao, data) {
    return CheckListRepository.update(id_checklist_movimentacao, data);
  }

  async delete(id_checklist_movimentacao) {
    return CheckListRepository.delete(id_checklist_movimentacao);
  }
}

module.exports = new CheckListService();
