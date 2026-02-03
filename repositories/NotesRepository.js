const { prisma } = require('../database')
const { buildWhere } = require('../utils')

class NotesRepository {
  buildInclude = () => ({
    PFUNC_APONTAMENTOS_CHAPAToPFUNC: {
      select: {
        CHAPA: true,
        NOME: true,
        BANCO_HORAS: true,
        CODFUNCAO: true,
        CODCOLIGADA: true
      }
    },
    GCCUSTO_APONTAMENTOS_CODCCUSTOToGCCUSTO: {
      select: {
        CODCUSTO: true,
        NOME: true,
        ATIVO: true,
        CODREDUZIDO: true,
        RESPONSAVEL: true
      }
    },
    STATUSAPONT_APONTAMENTOS_CODSTATUSAPONTToSTATUSAPONT: {
      select: {
        CODSTATUSAPONT: true,
        DESCRICAO: true
      }
    },
    PESSOA_APONTAMENTOS_CODLIDERToPESSOA: {
      select: {
        CODPESSOA: true,
        NOME: true
      }
    }
  })

  formatApontamento = (apontamento) => {
    if (!apontamento) return null
    
    const pfunc = apontamento.PFUNC_APONTAMENTOS_CHAPAToPFUNC
    const gccusto = apontamento.GCCUSTO_APONTAMENTOS_CODCCUSTOToGCCUSTO
    const statusApont = apontamento.STATUSAPONT_APONTAMENTOS_CODSTATUSAPONTToSTATUSAPONT
    const lider = apontamento.PESSOA_APONTAMENTOS_CODLIDERToPESSOA
    
    return {
      CODOS: apontamento.CODOS,
      INTEGRA: apontamento.INTEGRA,
      CODAPONT: apontamento.CODAPONT,
      CHAPA: apontamento.CHAPA,
      NOME_FUNCIONARIO: pfunc?.NOME || null,
      BANCO_HORAS: pfunc?.BANCO_HORAS || null,
      CODFUNCAO: pfunc?.CODFUNCAO || null,
      NOME_FUNCAO: null, // !!!!
      DATA: apontamento.DATA,
      CODCCUSTO: gccusto?.CODCUSTO || null,
      NOME_CENTRO_CUSTO: gccusto?.NOME || null,
      ATIVO_CENTRO_CUSTO: gccusto?.ATIVO || null,
      CODREDUZIDO: gccusto?.CODREDUZIDO || null,
      CODSTATUSAPONT: statusApont?.CODSTATUSAPONT || null,
      DESCRICAO_STATUS: statusApont?.DESCRICAO || null,
      CODPESSOA_LIDER: lider?.CODPESSOA || null,
      NOME_LIDER: lider?.NOME || null,
      CODPESSOA_GERENTE: null, // !!!!
      NOME_GERENTE: null,
      ATIVIDADE: apontamento.ATIVIDADE,
      CODSITUACAO: apontamento.CODSITUACAO,
      COMENTADO: apontamento.COMENTADO,
      MODIFICADOPOR: apontamento.MODIFICADOPOR,
      COMPETENCIA: apontamento.COMPETENCIA,
      ASSIDUIDADE: apontamento.ASSIDUIDADE,
      PONTO: apontamento.PONTO
    }
  }

  async getMany(params) {
    const numericFields = ['CODAPONT', 'CODOS', 'CHAPA', 'CODLIDER', 'COMPETENCIA']
    const where = {
      ...buildWhere(params, numericFields),
      CODAPONT: { gt: 0 }
    }
    
    const apontamentos = await prisma.aPONTAMENTOS.findMany({
      where,
      include: this.buildInclude(),
      orderBy: [
        { DATA: 'asc' },
        { PFUNC_APONTAMENTOS_CHAPAToPFUNC: { NOME: 'asc' } }
      ]
    })
    
    return apontamentos.map(this.formatApontamento)
  }
}

module.exports = new NotesRepository()