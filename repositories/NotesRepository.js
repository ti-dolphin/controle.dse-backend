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

    if (params.DATA_DE) {
      conditions.push('A.DATA >= ?')
      values.push(params.DATA_DE)
    }
    if (params.DATA_ATE) {
      conditions.push('A.DATA <= ?')
      values.push(params.DATA_ATE)
    }

    // Filtros booleanos (checkboxes)
    if (params.ATIVOS === 'true') {
      conditions.push("F.CODSITUACAO <> 'D'")
    }
    if (params.COMENTADOS === 'true') {
      conditions.push('A.COMENTADO = TRUE')
    }
    if (params.SEM_ASSIDUIDADE === 'true') {
      conditions.push('A.ASSIDUIDADE = FALSE')
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

  /**
   * Atualiza apontamento (sem alterar CODOS)
   */
  async update(CODAPONT, data) {
    const { CODSTATUSAPONT, CODCCUSTO, CODLIDER, ATIVIDADE, MODIFICADOPOR } = data

    const query = `
      UPDATE APONTAMENTOS SET 
        CODSTATUSAPONT = ?, 
        CODCCUSTO = ?, 
        CODLIDER = ?, 
        ATIVIDADE = ?, 
        INTEGRA = 0, 
        MODIFICADOPOR = ?
      WHERE CODAPONT = ?`

    await prisma.$executeRawUnsafe(query, CODSTATUSAPONT, CODCCUSTO, CODLIDER, ATIVIDADE, MODIFICADOPOR, CODAPONT)

    return { CODAPONT, ...data, INTEGRA: 0 }
  }

  /**
   * Altera apontamento (inclui CODOS)
   */
  async updateWithOS(CODAPONT, data) {
    const { CODSTATUSAPONT, CODCCUSTO, CODOS, CODLIDER, ATIVIDADE, MODIFICADOPOR } = data

    const query = `
      UPDATE APONTAMENTOS SET 
        CODSTATUSAPONT = ?, 
        CODCCUSTO = ?, 
        CODOS = ?, 
        CODLIDER = ?, 
        ATIVIDADE = ?, 
        INTEGRA = 0, 
        MODIFICADOPOR = ?
      WHERE CODAPONT = ?`

    const codosValue = CODOS === 0 ? null : CODOS

    await prisma.$executeRawUnsafe(query, CODSTATUSAPONT, CODCCUSTO, codosValue, CODLIDER, ATIVIDADE, MODIFICADOPOR, CODAPONT)

    return { CODAPONT, ...data, INTEGRA: 0 }
  }

  // ==================== PONTO ====================

  formatPonto = (row) => {
    if (!row) return null
    
    return {
      CODAPONT: row.CODAPONT,
      CHAPA: row.CHAPA,
      NOME_FUNCIONARIO: row.NOME_FUNCIONARIO,
      BANCO_HORAS: row.BANCO_HORAS,
      DATA: row.DATA,
      VERIFICADO: row.VERIFICADO,
      PROBLEMA: row.PROBLEMA,
      MOTIVO_PROBLEMA: row.MOTIVO_PROBLEMA,
      JUSTIFICATIVA: row.JUSTIFICATIVA,
      COMPETENCIA: row.COMPETENCIA,
      CODSTATUSAPONT: row.CODSTATUSAPONT,
      DESCRICAO_STATUS: row.DESCRICAO_STATUS,
      CODCCUSTO: row.CODCCUSTO,
      NOME_CENTRO_CUSTO: row.NOME_CENTRO_CUSTO,
      CODLIDER: row.CODLIDER,
      NOME_LIDER: row.NOME_LIDER,
      DATA_HORA_MOTIVO: row.DATA_HORA_MOTIVO,
      DATA_HORA_JUSTIFICATIVA: row.DATA_HORA_JUSTIFICATIVA,
      AJUSTADO: row.AJUSTADO,
      JUSTIFICADO_POR: row.JUSTIFICADO_POR
    }
  }

  buildWhereClausePonto = (params) => {
    const conditions = []
    const values = []
    
    if (params.CODAPONT) {
      conditions.push('A.CODAPONT = ?')
      values.push(Number(params.CODAPONT))
    }
    if (params.CHAPA) {
      conditions.push('A.CHAPA LIKE ?')
      values.push(`%${params.CHAPA}%`)
    }
    if (params.NOME_FUNCIONARIO) {
      conditions.push('F.NOME LIKE ?')
      values.push(`%${params.NOME_FUNCIONARIO}%`)
    }
    if (params.CODSTATUSAPONT) {
      conditions.push('A.CODSTATUSAPONT = ?')
      values.push(params.CODSTATUSAPONT)
    }
    if (params.DESCRICAO_STATUS) {
      conditions.push('SA.DESCRICAO LIKE ?')
      values.push(`%${params.DESCRICAO_STATUS}%`)
    }
    if (params.CODCCUSTO) {
      conditions.push('A.CODCCUSTO = ?')
      values.push(params.CODCCUSTO)
    }
    if (params.CODLIDER) {
      conditions.push('A.CODLIDER = ?')
      values.push(Number(params.CODLIDER))
    }
    if (params.COMPETENCIA) {
      conditions.push('A.COMPETENCIA = ?')
      values.push(Number(params.COMPETENCIA))
    }
    if (params.DATA_DE) {
      conditions.push('A.DATA >= ?')
      values.push(params.DATA_DE)
    }
    if (params.DATA_ATE) {
      conditions.push('A.DATA <= ?')
      values.push(params.DATA_ATE)
    }
    if (params.VERIFICADO === 'true') {
      conditions.push('A.VERIFICADO = TRUE')
    }
    if (params.VERIFICADO === 'false') {
      conditions.push('(A.VERIFICADO = FALSE OR A.VERIFICADO IS NULL)')
    }
    if (params.PROBLEMA === 'true') {
      conditions.push('A.PROBLEMA = TRUE')
    }
    if (params.AJUSTADO === 'true') {
      conditions.push('A.AJUSTADO = TRUE')
    }
    if (params.ATIVOS === 'true') {
      conditions.push("F.CODSITUACAO <> 'D'")
    }
    if (params.MOTIVO_PROBLEMA) {
      conditions.push('A.MOTIVO_PROBLEMA LIKE ?')
      values.push(`%${params.MOTIVO_PROBLEMA}%`)
    }
    
    if (params.searchTerm) {
      const searchValue = `%${params.searchTerm}%`
      conditions.push(`(
        F.NOME LIKE ? OR 
        A.CHAPA LIKE ? OR
        C.NOME LIKE ? OR
        A.MOTIVO_PROBLEMA LIKE ?
      )`)
      values.push(searchValue, searchValue, searchValue, searchValue)
    }
    
    return { conditions, values }
  }

  async getManyPonto(params = {}) {
    const { conditions, values } = this.buildWhereClausePonto(params)
    
    let whereClause = 'A.CODAPONT > 0'
    if (conditions.length > 0) {
      whereClause += ' AND ' + conditions.join(' AND ')
    }
    
    const page = params.page ? Number(params.page) : 0
    const pageSize = params.pageSize ? Number(params.pageSize) : 100
    const offset = page * pageSize
    
    const query = `
      SELECT 
        A.CODAPONT, 
        F.CHAPA, 
        F.NOME AS NOME_FUNCIONARIO, 
        F.BANCO_HORAS, 
        A.DATA,
        A.VERIFICADO, 
        A.PROBLEMA, 
        A.MOTIVO_PROBLEMA,
        A.JUSTIFICATIVA, 
        A.COMPETENCIA, 
        A.CODSTATUSAPONT, 
        SA.DESCRICAO AS DESCRICAO_STATUS,
        A.CODCCUSTO, 
        C.NOME AS NOME_CENTRO_CUSTO, 
        A.CODLIDER, 
        P.NOME AS NOME_LIDER, 
        A.DATA_HORA_MOTIVO,
        A.DATA_HORA_JUSTIFICATIVA, 
        A.AJUSTADO, 
        A.JUSTIFICADO_POR
      FROM APONTAMENTOS A
        INNER JOIN PFUNC F ON A.CHAPA = F.CHAPA AND F.CODCOLIGADA = 1
        INNER JOIN GCCUSTO C ON A.CODCCUSTO = C.CODCUSTO
        INNER JOIN PESSOA P ON A.CODLIDER = P.CODPESSOA
        INNER JOIN STATUSAPONT SA ON A.CODSTATUSAPONT = SA.CODSTATUSAPONT
      WHERE 
        ${whereClause}
      ORDER BY 
        A.DATA DESC, F.NOME
      LIMIT ${pageSize} OFFSET ${offset}
    `
    
    const results = await prisma.$queryRawUnsafe(query, ...values)
    return results.map(this.formatPonto)
  }

  // ==================== PROBLEMA ====================

  formatProblema = (row) => {
    if (!row) return null
    
    return {
      CODAPONT: row.CODAPONT,
      CHAPA: row.CHAPA,
      NOME_FUNCIONARIO: row.NOME_FUNCIONARIO,
      CODSITUACAO: row.CODSITUACAO,
      DATA: row.DATA,
      COMPETENCIA: row.COMPETENCIA,
      COMENTADO: row.COMENTADO,
      PROBLEMA: row.PROBLEMA,
      CODSTATUSAPONT: row.CODSTATUSAPONT,
      DESCRICAO_STATUS: row.DESCRICAO_STATUS,
      CODCCUSTO: row.CODCCUSTO,
      NOME_CENTRO_CUSTO: row.NOME_CENTRO_CUSTO,
      CODPESSOA_GERENTE: row.CODPESSOA_GERENTE,
      NOME_GERENTE: row.NOME_GERENTE,
      EMAIL_GERENTE: row.EMAIL_GERENTE,
      NOME_LIDER: row.NOME_LIDER,
      MOTIVO_PROBLEMA: row.MOTIVO_PROBLEMA,
      JUSTIFICATIVA: row.JUSTIFICATIVA
    }
  }

  buildWhereClauseProblema = (params) => {
    const conditions = []
    const values = []
    
    if (params.CODAPONT) {
      conditions.push('A.CODAPONT = ?')
      values.push(Number(params.CODAPONT))
    }
    if (params.CHAPA) {
      conditions.push('A.CHAPA LIKE ?')
      values.push(`%${params.CHAPA}%`)
    }
    if (params.NOME_FUNCIONARIO) {
      conditions.push('F.NOME LIKE ?')
      values.push(`%${params.NOME_FUNCIONARIO}%`)
    }
    if (params.CODSTATUSAPONT) {
      conditions.push('A.CODSTATUSAPONT = ?')
      values.push(params.CODSTATUSAPONT)
    }
    if (params.DESCRICAO_STATUS) {
      conditions.push('SA.DESCRICAO LIKE ?')
      values.push(`%${params.DESCRICAO_STATUS}%`)
    }
    if (params.CODCCUSTO) {
      conditions.push('A.CODCCUSTO = ?')
      values.push(params.CODCCUSTO)
    }
    if (params.NOME_CENTRO_CUSTO) {
      conditions.push('C.NOME LIKE ?')
      values.push(`%${params.NOME_CENTRO_CUSTO}%`)
    }
    if (params.NOME_GERENTE) {
      conditions.push('GERENTE.NOME LIKE ?')
      values.push(`%${params.NOME_GERENTE}%`)
    }
    if (params.NOME_LIDER) {
      conditions.push('LIDER.NOME LIKE ?')
      values.push(`%${params.NOME_LIDER}%`)
    }
    if (params.COMPETENCIA) {
      conditions.push('A.COMPETENCIA = ?')
      values.push(Number(params.COMPETENCIA))
    }
    if (params.DATA_DE) {
      conditions.push('A.DATA >= ?')
      values.push(params.DATA_DE)
    }
    if (params.DATA_ATE) {
      conditions.push('A.DATA <= ?')
      values.push(params.DATA_ATE)
    }
    if (params.ATIVOS === 'true') {
      conditions.push("F.CODSITUACAO <> 'D'")
    }
    if (params.COMENTADO === 'true') {
      conditions.push('A.COMENTADO = TRUE')
    }
    if (params.MOTIVO_PROBLEMA) {
      conditions.push('A.MOTIVO_PROBLEMA LIKE ?')
      values.push(`%${params.MOTIVO_PROBLEMA}%`)
    }
    if (params.JUSTIFICATIVA) {
      conditions.push('A.JUSTIFICATIVA LIKE ?')
      values.push(`%${params.JUSTIFICATIVA}%`)
    }
    
    if (params.searchTerm) {
      const searchValue = `%${params.searchTerm}%`
      conditions.push(`(
        F.NOME LIKE ? OR 
        A.CHAPA LIKE ? OR
        C.NOME LIKE ? OR
        LIDER.NOME LIKE ? OR
        A.MOTIVO_PROBLEMA LIKE ? OR
        A.JUSTIFICATIVA LIKE ?
      )`)
      values.push(searchValue, searchValue, searchValue, searchValue, searchValue, searchValue)
    }
    
    return { conditions, values }
  }

  async getManyProblema(params = {}) {
    const { conditions, values } = this.buildWhereClauseProblema(params)
    
    let whereClause = 'A.PROBLEMA = TRUE'
    if (conditions.length > 0) {
      whereClause += ' AND ' + conditions.join(' AND ')
    }
    
    const page = params.page ? Number(params.page) : 0
    const pageSize = params.pageSize ? Number(params.pageSize) : 100
    const offset = page * pageSize
    
    const query = `
      SELECT 
        A.CODAPONT, 
        A.COMENTADO, 
        A.DATA,
        A.PROBLEMA, 
        A.COMPETENCIA,
        F.CHAPA, 
        F.NOME AS NOME_FUNCIONARIO, 
        F.CODSITUACAO,
        C.CODCUSTO AS CODCCUSTO,
        C.NOME AS NOME_CENTRO_CUSTO, 
        GERENTE.CODPESSOA AS CODPESSOA_GERENTE, 
        GERENTE.NOME AS NOME_GERENTE, 
        GERENTE.EMAIL AS EMAIL_GERENTE,
        A.CODSTATUSAPONT, 
        SA.DESCRICAO AS DESCRICAO_STATUS, 
        LIDER.NOME AS NOME_LIDER,
        A.MOTIVO_PROBLEMA, 
        A.JUSTIFICATIVA
      FROM APONTAMENTOS A
        INNER JOIN PFUNC F ON A.CHAPA = F.CHAPA AND F.CODCOLIGADA = 1
        INNER JOIN GCCUSTO C ON A.CODCCUSTO = C.CODCUSTO
        INNER JOIN STATUSAPONT SA ON A.CODSTATUSAPONT = SA.CODSTATUSAPONT
        LEFT JOIN PESSOA GERENTE ON GERENTE.CODGERENTE = C.RESPONSAVEL
        INNER JOIN PESSOA LIDER ON LIDER.CODPESSOA = A.CODLIDER
      WHERE 
        ${whereClause}
      ORDER BY 
        A.DATA DESC, F.NOME
      LIMIT ${pageSize} OFFSET ${offset}
    `
    
    const results = await prisma.$queryRawUnsafe(query, ...values)
    return results.map(this.formatProblema)
  }

  // ==================== OPÇÕES PARA APONTAR ====================

  async getCentroCustos(ativos = true) {
    let whereClause = ''
    if (ativos) {
      whereClause = 'WHERE ATIVO = TRUE'
    }
    
    const query = `
      SELECT 
        CODCUSTO,
        NOME,
        CODREDUZIDO,
        ATIVO
      FROM GCCUSTO
      ${whereClause}
      ORDER BY NOME
    `
    
    const results = await prisma.$queryRawUnsafe(query)
    return results.map(row => ({
      CODCUSTO: row.CODCUSTO,
      NOME: row.NOME,
      CODREDUZIDO: row.CODREDUZIDO,
      ATIVO: row.ATIVO
    }))
  }

  async getStatusApontamento() {
    const query = `
      SELECT 
        CODSTATUSAPONT,
        DESCRICAO
      FROM STATUSAPONT
      ORDER BY DESCRICAO
    `
    
    const results = await prisma.$queryRawUnsafe(query)
    return results.map(row => ({
      CODSTATUSAPONT: row.CODSTATUSAPONT,
      DESCRICAO: row.DESCRICAO
    }))
  }

  async getLideres() {
    const query = `
      SELECT 
        CODPESSOA,
        NOME
      FROM PESSOA
      WHERE ATIVO = TRUE
      ORDER BY NOME
    `
    
    const results = await prisma.$queryRawUnsafe(query)
    return results.map(row => ({
      CODPESSOA: row.CODPESSOA,
      NOME: row.NOME
    }))
  }

  // ==================== APONTAR EM BATCH ====================

  async updateBatch(codaponts, data) {
    const { 
      CODSTATUSAPONT, 
      CODCCUSTO, 
      CODLIDER, 
      MODIFICADOPOR,
      updateOnlyEmptyCentroCusto,
      updateOnlyEmptyLider,
      updateOnlyEmptyStatus
    } = data

    let updates = []
    let values = []

    if (CODCCUSTO) {
      if (updateOnlyEmptyCentroCusto) {
        updates.push('CODCCUSTO = CASE WHEN CODCCUSTO IS NULL OR CODCCUSTO = "" THEN ? ELSE CODCCUSTO END')
      } else {
        updates.push('CODCCUSTO = ?')
      }
      values.push(CODCCUSTO)
    }

    if (CODLIDER) {
      if (updateOnlyEmptyLider) {
        updates.push('CODLIDER = CASE WHEN CODLIDER IS NULL OR CODLIDER = 0 THEN ? ELSE CODLIDER END')
      } else {
        updates.push('CODLIDER = ?')
      }
      values.push(CODLIDER)
    }

    if (CODSTATUSAPONT) {
      if (updateOnlyEmptyStatus) {
        updates.push('CODSTATUSAPONT = CASE WHEN CODSTATUSAPONT IS NULL OR CODSTATUSAPONT = "-" THEN ? ELSE CODSTATUSAPONT END')
      } else {
        updates.push('CODSTATUSAPONT = ?')
      }
      values.push(CODSTATUSAPONT)
    }

    if (updates.length === 0) {
      return { updated: 0 }
    }

    updates.push('INTEGRA = 0')
    updates.push('MODIFICADOPOR = ?')
    values.push(MODIFICADOPOR)

    const placeholders = codaponts.map(() => '?').join(', ')
    values.push(...codaponts)

    const query = `
      UPDATE APONTAMENTOS SET 
        ${updates.join(', ')}
      WHERE CODAPONT IN (${placeholders})
    `

    const result = await prisma.$executeRawUnsafe(query, ...values)
    return { updated: result }
  }
}

module.exports = new NotesRepository()