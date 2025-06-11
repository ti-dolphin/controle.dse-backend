const { prisma } = require('../database');

class UserRepository {
  static async getUserWithPermissionsByLogin(login) {
    return await prisma.pessoa.findUnique({
      where: { LOGIN: login },
      select: {
        CODPESSOA: true,
        CODGERENTE: true,
        NOME: true,
        LOGIN: true,
        EMAIL: true,
        ATIVO: true,
        SOLICITANTE: true,
        RESPONSAVEL: true,
        LIDER: true,
        PERM_LOGIN: true,
        PERM_EPI: true,
        PERM_AUTENTICACAO: true,
        PERM_OS: true,
        PERM_TIPO: true,
        PERM_STATUS: true,
        PERM_APONT: true,
        PERM_STATUS_APONT: true,
        PERM_PESSOAS: true,
        PERM_COMENT_OS: true,
        PERM_COMENT_APONT: true,
        PERM_PONTO: true,
        PERM_VENDA: true,
        PERM_CADEPI: true,
        PERM_DESCONTADO: true,
        PERM_GESTAO_PESSOAS: true,
        PERM_CONTROLE_RECESSO: true,
        PERM_CUSTO: true,
        PERM_FERRAMENTAS: true,
        PERM_CHECKLIST: true,
        PERM_PROSPECCAO: true,
        PERM_APONTAMENTO_PONTO: true,
        PERM_APONTAMENTO_PONTO_JUSTIFICATIVA: true,
        PERM_BANCO_HORAS: true,
        PERM_FOLGA: true,
        PERM_REQUISITAR: true,
        PERM_COMPRADOR: true,
        PERM_CADASTRAR_PAT: true,
        PERM_ADMINISTRADOR: true,
        PERM_COMERCIAL: true
      }
    });
  }
}

module.exports = UserRepository;
