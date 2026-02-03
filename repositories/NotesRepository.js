const { prisma } = require('../database')

class NotesRepository {
  formatApontamento = (row) => {
    if (!row) return null
    
    return {
      CODOS: row.CODOS,
      INTEGRA: row.INTEGRA,
      CODAPONT: row.CODAPONT,
      CHAPA: row.CHAPA,
      NOME_FUNCIONARIO: row.NOME_FUNCIONARIO,
      BANCO_HORAS: row.BANCO_HORAS,
      CODFUNCAO: row.CODFUNCAO,
      NOME_FUNCAO: row.NOME_FUNCAO,
      DATA: row.DATA,
      CODCCUSTO: row.CODCCUSTO,
      NOME_CENTRO_CUSTO: row.NOME_CENTRO_CUSTO,
      ATIVO_CENTRO_CUSTO: row.ATIVO_CENTRO_CUSTO,
      CODREDUZIDO: row.CODREDUZIDO,
      CODSTATUSAPONT: row.CODSTATUSAPONT,
      DESCRICAO_STATUS: row.DESCRICAO_STATUS,
      CODPESSOA_LIDER: row.CODPESSOA_LIDER,
      NOME_LIDER: row.NOME_LIDER,
      CODPESSOA_GERENTE: row.CODPESSOA_GERENTE,
      NOME_GERENTE: row.NOME_GERENTE,
      ATIVIDADE: row.ATIVIDADE,
      CODSITUACAO: row.CODSITUACAO,
      COMENTADO: row.COMENTADO,
      MODIFICADOPOR: row.MODIFICADOPOR,
      COMPETENCIA: row.COMPETENCIA,
      ASSIDUIDADE: row.ASSIDUIDADE,
      PONTO: row.PONTO
    }
  }

  buildWhereClause = (params) => {
    const conditions = []
    const values = []
    
    // Filtros exatos
    if (params.CODAPONT) {
      conditions.push('A.CODAPONT = ?')
      values.push(Number(params.CODAPONT))
    }
    if (params.CODOS) {
      conditions.push('A.CODOS = ?')
      values.push(Number(params.CODOS))
    }
    if (params.CHAPA) {
      conditions.push('A.CHAPA LIKE ?')
      values.push(`%${params.CHAPA}%`)
    }
    if (params.CODLIDER) {
      conditions.push('A.CODLIDER = ?')
      values.push(Number(params.CODLIDER))
    }
    if (params.COMPETENCIA) {
      conditions.push('A.COMPETENCIA = ?')
      values.push(Number(params.COMPETENCIA))
    }
    if (params.CODSTATUSAPONT) {
      conditions.push('A.CODSTATUSAPONT = ?')
      values.push(params.CODSTATUSAPONT)
    }
    if (params.CODCCUSTO) {
      conditions.push('A.CODCCUSTO = ?')
      values.push(params.CODCCUSTO)
    }
    if (params.CODSITUACAO) {
      conditions.push('A.CODSITUACAO = ?')
      values.push(params.CODSITUACAO)
    }
    
    // Filtros LIKE para campos de texto (vem do frontend)
    if (params.NOME_FUNCIONARIO) {
      conditions.push('F.NOME LIKE ?')
      values.push(`%${params.NOME_FUNCIONARIO}%`)
    }
    if (params.NOME_FUNCAO) {
      conditions.push('FUN.NOME LIKE ?')
      values.push(`%${params.NOME_FUNCAO}%`)
    }
    if (params.NOME_CENTRO_CUSTO) {
      conditions.push('C.NOME LIKE ?')
      values.push(`%${params.NOME_CENTRO_CUSTO}%`)
    }
    if (params.DESCRICAO_STATUS) {
      conditions.push('SA.DESCRICAO LIKE ?')
      values.push(`%${params.DESCRICAO_STATUS}%`)
    }
    if (params.NOME_LIDER) {
      conditions.push('P.NOME LIKE ?')
      values.push(`%${params.NOME_LIDER}%`)
    }
    if (params.NOME_GERENTE) {
      conditions.push('PG.NOME LIKE ?')
      values.push(`%${params.NOME_GERENTE}%`)
    }
    
    // Busca geral (searchTerm)
    if (params.searchTerm) {
      const searchValue = `%${params.searchTerm}%`
      conditions.push(`(
        F.NOME LIKE ? OR 
        FUN.NOME LIKE ? OR 
        C.NOME LIKE ? OR 
        P.NOME LIKE ? OR 
        A.ATIVIDADE LIKE ? OR
        A.CHAPA LIKE ?
      )`)
      values.push(searchValue, searchValue, searchValue, searchValue, searchValue, searchValue)
    }
    
    return { conditions, values }
  }

  async getMany(params = {}) {
    const { conditions, values } = this.buildWhereClause(params)
    
    let whereClause = 'A.CODAPONT > 0'
    if (conditions.length > 0) {
      whereClause += ' AND ' + conditions.join(' AND ')
    }
    
    // Paginação
    const page = params.page ? Number(params.page) : 0
    const pageSize = params.pageSize ? Number(params.pageSize) : 100
    const offset = page * pageSize
    
    const query = `
      SELECT 
        A.CODOS, 
        A.INTEGRA, 
        A.CODAPONT, 
        A.CHAPA, 
        F.NOME AS NOME_FUNCIONARIO, 
        F.BANCO_HORAS, 
        F.CODFUNCAO,
        FUN.NOME AS NOME_FUNCAO, 
        A.DATA, 
        C.CODCUSTO AS CODCCUSTO, 
        C.NOME AS NOME_CENTRO_CUSTO, 
        C.ATIVO AS ATIVO_CENTRO_CUSTO, 
        C.CODREDUZIDO, 
        A.CODSTATUSAPONT, 
        SA.DESCRICAO AS DESCRICAO_STATUS,
        P.CODPESSOA AS CODPESSOA_LIDER, 
        P.NOME AS NOME_LIDER, 
        PG.CODPESSOA AS CODPESSOA_GERENTE, 
        PG.NOME AS NOME_GERENTE, 
        A.ATIVIDADE, 
        A.CODSITUACAO, 
        A.COMENTADO, 
        A.MODIFICADOPOR,
        A.COMPETENCIA, 
        A.ASSIDUIDADE, 
        A.PONTO
      FROM  
        APONTAMENTOS A
        INNER JOIN PFUNC F ON A.CHAPA = F.CHAPA AND F.CODCOLIGADA = 1
        INNER JOIN PFUNCAO FUN ON F.CODFUNCAO = FUN.CODFUNCAO AND FUN.CODCOLIGADA = 1
        INNER JOIN GCCUSTO C ON A.CODCCUSTO = C.CODCUSTO
        LEFT JOIN PESSOA PG ON PG.CODGERENTE = C.RESPONSAVEL
        INNER JOIN PESSOA P ON A.CODLIDER = P.CODPESSOA
        INNER JOIN STATUSAPONT SA ON SA.CODSTATUSAPONT = A.CODSTATUSAPONT
      WHERE 
        ${whereClause}
      ORDER BY 
        A.DATA DESC, F.NOME
      LIMIT ${pageSize} OFFSET ${offset}
    `
    
    const results = await prisma.$queryRawUnsafe(query, ...values)
    return results.map(this.formatApontamento)
  }
}

module.exports = new NotesRepository()