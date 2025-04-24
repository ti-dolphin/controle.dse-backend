const { prisma } = require("../database");

class OpportunityRepository {
  static getOppsByManagerQuery = () => {
    return `SELECT
    P.CODPESSOA,
    P.NOME,
    P.EMAIL,
    (
        SELECT
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'ID_PROJETO', OS.ID_PROJETO,
                    'ADICIONAL', AD.NUMERO,
                    'NOME', OS.NOME,
                    'VALORFATDOLPHIN', CONCAT('R$ ', FORMAT(OS.VALORFATDOLPHIN, 2, 'de_DE')),
                    'VALORFATDIRETO', CONCAT('R$ ', FORMAT(OS.VALORFATDIRETO, 2, 'de_DE')),
                    'VALORTOTAL', CONCAT('R$ ', FORMAT(IFNULL(OS.VALORFATDIRETO, 0) + IFNULL(OS.VALORFATDOLPHIN, 0), 2, 'de_DE'))
                )
            )
        FROM
            ORDEMSERVICO OS
            INNER JOIN PROJETOS PROJ ON PROJ.ID = OS.ID_PROJETO
            INNER JOIN ADICIONAIS AD ON OS.ID_ADICIONAL = AD.ID
        WHERE
            PROJ.CODGERENTE = P.CODGERENTE
            AND OS.CODSTATUS IN (SELECT CODSTATUS FROM STATUS WHERE ACAO = 0)
            AND OS.CODTIPOOS = 21
            AND OS.DATAINTERACAO < CURDATE()
            AND PROJ.ATIVO = 1
    ) AS expiredOpportunities,
    (
        SELECT
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'ID_PROJETO', OS.ID_PROJETO,
                    'ADICIONAL', AD.NUMERO,
                    'NOME', OS.NOME,
                    'VALORFATDOLPHIN', CONCAT('R$ ', FORMAT(OS.VALORFATDOLPHIN, 2, 'de_DE')),
                    'VALORFATDIRETO', CONCAT('R$ ', FORMAT(OS.VALORFATDIRETO, 2, 'de_DE')),
                    'VALORTOTAL',
                     CONCAT('R$ ', FORMAT(IFNULL(OS.VALORFATDIRETO, 0) + IFNULL(OS.VALORFATDOLPHIN, 0), 2, 'de_DE'))
                )
            )
        FROM
            ORDEMSERVICO OS
            INNER JOIN PROJETOS PROJ ON PROJ.ID = OS.ID_PROJETO
            INNER JOIN ADICIONAIS AD ON OS.ID_ADICIONAL = AD.ID
        WHERE
            PROJ.CODGERENTE = P.CODGERENTE
            AND OS.CODTIPOOS = 21
            AND OS.CODSTATUS IN (SELECT CODSTATUS FROM STATUS WHERE ACAO = 0)
            AND OS.DATAINTERACAO >= CURDATE()
            AND OS.DATAINTERACAO <= DATE_ADD(CURDATE(), INTERVAL 4 DAY)
            AND PROJ.ATIVO = 1
    ) AS toExpireOpportunities
FROM
    PESSOA P
WHERE
    P.CODGERENTE IS NOT NULL;`;
  };

  static getOppsByComercialResponsableQuery = () => {
    return `
                SELECT
    P.CODPESSOA,
    P.NOME,
    P.EMAIL,
    (
        SELECT
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'ID_PROJETO', OS.ID_PROJETO,
                    'ADICIONAL', AD.NUMERO,
                    'NOME', OS.NOME,
                    'VALORFATDOLPHIN', CONCAT('R$ ', FORMAT(OS.VALORFATDOLPHIN, 2, 'de_DE')),
                     'VALORFATDIRETO', CONCAT('R$ ', FORMAT(OS.VALORFATDIRETO, 2, 'de_DE')),
                    'VALORTOTAL', CONCAT('R$ ', FORMAT(IFNULL(OS.VALORFATDIRETO, 0) + IFNULL(OS.VALORFATDOLPHIN, 0), 2, 'de_DE'))
                )
            )
        FROM
            ORDEMSERVICO OS
            INNER JOIN PROJETOS PROJ ON PROJ.ID = OS.ID_PROJETO
            INNER JOIN PESSOA P2 ON PROJ.CODGERENTE = P2.CODGERENTE
            INNER JOIN ADICIONAIS AD ON OS.ID_ADICIONAL = AD.ID
        WHERE
            OS.RESPONSAVEL = P.CODPESSOA
            AND CODSTATUS IN (SELECT CODSTATUS FROM STATUS WHERE ACAO = 0)
            AND OS.CODTIPOOS = 21
            AND OS.DATAINTERACAO < CURDATE()
            AND PROJ.ATIVO = 1
    ) AS expiredOpportunities,
    (
        SELECT
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'ID_PROJETO', OS.ID_PROJETO,
                    'ADICIONAL', AD.NUMERO,
                    'NOME', OS.NOME,
                    'VALORFATDOLPHIN', CONCAT('R$ ', FORMAT(OS.VALORFATDOLPHIN, 2, 'de_DE')),
                     'VALORFATDIRETO', CONCAT('R$ ', FORMAT(OS.VALORFATDIRETO, 2, 'de_DE')),
                    'VALORTOTAL', CONCAT('R$ ', FORMAT(IFNULL(OS.VALORFATDIRETO, 0) + IFNULL(OS.VALORFATDOLPHIN, 0), 2, 'de_DE'))
                )
            )
        FROM
            ORDEMSERVICO OS
            INNER JOIN PROJETOS PROJ ON PROJ.ID = OS.ID_PROJETO
            INNER JOIN PESSOA P2 ON PROJ.CODGERENTE = P2.CODGERENTE
            INNER JOIN ADICIONAIS AD ON AD.ID_PROJETO = PROJ.ID
        WHERE
            OS.RESPONSAVEL = P.CODPESSOA
            AND OS.CODTIPOOS = 21
			AND CODSTATUS IN (SELECT CODSTATUS FROM STATUS WHERE ACAO = 0)
            AND OS.DATAINTERACAO >= CURDATE()
            AND OS.DATAINTERACAO <= DATE_ADD(CURDATE(), INTERVAL 4 DAY)
		    AND PROJ.ATIVO = 1

    ) AS toExpireOpportunities
FROM
    PESSOA P WHERE P.PERM_COMERCIAL = 1;
                `;
  };

  static deleteOppFilesQuery = (idsToDeleteString) => {
    return `
    DELETE FROM web_anexos_os WHERE id_anexo_os in ${idsToDeleteString}`;
  };

  static getAllFollowers = () => {
    return `
      SELECT * FROM web_seguidores_projeto WHERE ativo = 1
    `;
  };

  static deleteAllfollowersByProjectId = () => {
    return `
     DELETE FROM web_seguidores_projeto WHERE id_projeto = ?
    `;
  };

  static deleteFollowersByProjectIdQuery = (currentFollowerCodpessoaList) => {
    return `
    DELETE FROM web_seguidores_projeto WHERE id_projeto = ? AND codpessoa NOT IN  (${currentFollowerCodpessoaList})`;
  };

  static createFollowerQuery = () => {
    return `
          insert into 
        web_seguidores_projeto (
          id_seguidor_projeto, 
          id_projeto, 
          codpessoa, 
          ativo
        )
      values
        (?,?,?,?);
    `;
  };

  static updateCommentQuery = () => {
    return `
      UPDATE COMENTARIOS SET
      DESCRICAO =?
      WHERE CODCOMENTARIO = ?
    `;
  };
  static insertCommentQuery = () => {
    return `
        INSERT INTO COMENTARIOS
        (CODAPONT, CODOS, DESCRICAO, RECCREATEDON, RECCREATEDBY, EMAIL)
        VALUES 
        (?, ?, ?, ?, ? ,?)
    `;
  };

  static getOppFilesQuery = () => {
    return `
          SELECT id_anexo_os,codos,nome_arquivo,arquivo FROM web_anexos_os where codos = ? ;
    `;
  };

  static createOppFileQuery = () => {
    return `insert into web_anexos_os (
        codos, nome_arquivo, 
        arquivo
      ) 
      values 
        (?, ?, ?);
      `;
  };

  static updateOpportunity = async (oppId, opp, user) => {
    delete opp.CODOS;
    delete opp.web_anexos_os;
    return await prisma.ordemservico.update({
      where: {
      CODOS: Number(oppId),
      },
      data: opp
    })
  };
  static createAdicional = () => {
    return `INSERT INTO ADICIONAIS (ID_PROJETO, NUMERO)
      SELECT ?, IFNULL(MAX(NUMERO), -1) + 1
      FROM ADICIONAIS
      WHERE ID_PROJETO = ?`;
  };

  static createOpportunityQuery = () => {
    return `
            INSERT INTO ORDEMSERVICO (
            CODOS, CODTIPOOS, CODCCUSTO, OBRA, DATASOLICITACAO, DATANECESSIDADE, DOCREFERENCIA, LISTAMATERIAIS, DATAINICIO, DATAPREVENTREGA, 
            DATAENTREGA, CODSTATUS, NOME, DESCRICAO, ATIVIDADES, PRIORIDADE, SOLICITANTE, RESPONSAVEL, CODDISCIPLINA, GUT, GRAVIDADE, 
            URGENCIA, TENDENCIA, DATALIBERACAO, RELACIONAMENTO, FK_CODCLIENTE, FK_CODCOLIGADA, VALORFATDIRETO, VALORSERVICOMO, VALORSERVICOMATAPLICADO, 
            VALORMATERIAL, VALORTOTAL, CODSEGMENTO, CODCIDADE, VALORLOCACAO, ID_ADICIONAL, ID_PROJETO, DATAINTERACAO, VALORFATDOLPHIN, PRINCIPAL, 
            VALOR_COMISSAO, id_motivo_perdido, observacoes, DESCRICAO_VENDA, EMAIL_VENDA_ENVIADO
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          );
    `;
  };

  static getOppStatusList = async () => {
    return await prisma.status.findMany();
  };
  
  static getOpportunityById = async (id) => {
    const opp = await prisma.ordemservico
      .findFirst({
        where: {
          CODOS: Number(id),
        },
        include: {
          web_anexos_os: true,
          projetos: {
            include: {
              pessoa: {
                select: {
                  NOME: true,
                  CODPESSOA: true,
                },
              },
            },
          },
          cliente: true,
          pessoa: {
            select: {
              NOME: true,
              CODPESSOA: true,
            },
          },
          status: true,
          adicionais: true,
        },
      })
      .then((opp) => ({
        ...opp,
        responsavel: { ...opp.pessoa },
        projeto: { ...opp.projetos, gerente: opp.projetos.pessoa },
        adicional : { ...opp.adicionais },
      }));
    const comments = await prisma.comentarios.findMany({
      where: {
        CODOS: Number(id),
      },
    });
    console.log('comments', comments);
    return { ...opp, comentarios : comments };
  };

  static async getOppornities(params) {
    return await prisma.ordemservico
      .findMany({
        include: {
          projetos: {
            include: {
              pessoa: {
                select: {
                  CODGERENTE: true,
                  NOME: true,
                },
              },
            },
          },
          adicionais: true,
          cliente: {
            select: {
              CODCOLIGADA: true,
              CODCLIENTE: true,
              NOMEFANTASIA: true,
            },
          },
          pessoa: {
            select: {
              CODPESSOA: true,
              NOME: true,
            },
          },
          status: true,
        },
        where: {
          projetos: {
            ATIVO: 1,
            OR: [
              {
                web_seguidores_projeto: {
                  some: {
                    codpessoa: Number(params.codpessoa),
                  },
                },
              },
              {
                pessoa: {
                  PERM_ADMINISTRADOR: 1,
                },
              },
            ],
          },
          status: {
            ACAO: Number(params.acao),
          },
        },
      })
      .then((results) =>
        results.map((opp) => ({  
          ...opp,
          projeto: { ...opp.projetos, gerente: { ...opp.projetos.pessoa } },
          responsavel: { ...opp.pessoa },
        }))
      );
  }
}

module.exports = OpportunityRepository;
