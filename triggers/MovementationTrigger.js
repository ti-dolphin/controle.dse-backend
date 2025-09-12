const CheckListRepository = require("../repositories/CheckListRepository");



class MovementationTrigger { 
    static afterCreate = async (mov, tx ) =>  {
            const checklist = await CheckListRepository.create(mov.id_movimentacao, tx);
            return checklist;
    }
}
module.exports = MovementationTrigger