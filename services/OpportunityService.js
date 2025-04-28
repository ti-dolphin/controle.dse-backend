const OpportunityRepository = require("../repositories/OpportunityRepository");
const pool = require("../database");
const ProjectService = require("./ProjectService");
const fireBaseService = require("./fireBaseService");
const utils = require("../utils");
const EmailService = require("./EmailService");
const OpportunityView = require("../views/OpportunityViews");
const {prisma} = require("../database");

class OpportunityService {
  static getOpportunityById = async (oppId) => {
    return await OpportunityRepository.getOpportunityById(oppId);
  };

  static getOpportunityFiles = async (oppId) => {
    //get the files from db
    const oppFiles = await this.executeQuery(
      OpportunityRepository.getOppFilesQuery(),
      [oppId]
    );
    return oppFiles;
  };

  static createOpportunityFiles = async (oppId, files) => {
    await Promise.all(
      files.map(async (file) => {
        await fireBaseService.uploadFileToFireBase(file.path);
        const createdFile = await fireBaseService.getFileByName(file.filename);
        await createdFile.makePublic();
        const fileUrl = createdFile ? createdFile.publicUrl() : null;
        if (fileUrl) {
          const result = await this.executeQuery(
            OpportunityRepository.createOppFileQuery(),
            [oppId, file.filename, fileUrl]
          );
          utils.removeFile(file.path);
          return result.insertId;
        }
      })
    );
  };

  static createOpportunity = async (opp) => {
    const {
      codOs,
      codTipoOs,
      codCCusto,
      obra,
      dataSolicitacao,
      dataNecessidade,
      docReferencia,
      listaMateriais,
      dataInicio,
      dataPrevEntrega,
      dataEntrega,
      codStatus,
      nome,
      descricao,
      atividades,
      prioridade,
      solicitante,
      responsavel,
      codDisciplina,
      gut,
      gravidade,
      urgencia,
      tendencia,
      dataLiberacao,
      relacionamento,
      fkCodCliente,
      fkCodColigada,
      valorFatDireto,
      valorServicoMO,
      valorServicoMatAplicado,
      valorMaterial,
      valorTotal,
      codSegmento,
      codCidade,
      valorLocacao,
      idAdicional,
      idProjeto,
      dataInteracao,
      valorFatDolphin,
      principal,
      valorComissao,
      idMotivoPerdido,
      observacoes,
      descricaoVenda,
      emailVendaEnviado,
      comentarios,
      seguidores,
    } = opp;
    const isAdicional =
      idProjeto !== 0 && idProjeto !== null && idProjeto !== undefined;
    if (isAdicional) {
      const adicionalInsertResult = await this.executeQuery(
        OpportunityRepository.createAdicional(),
        [idProjeto, idProjeto]
      );
      const result = await this.executeQuery(
        OpportunityRepository.createOpportunityQuery(),
        [
          codOs,
          codTipoOs,
          codCCusto,
          obra,
          dataSolicitacao
            ? dataSolicitacao.slice(0, 19).replace("T", " ")
            : null, // Formata dataSolicitacao
          dataNecessidade
            ? dataNecessidade.slice(0, 19).replace("T", " ")
            : null, // Formata dataNecessidade
          docReferencia,
          listaMateriais,
          dataInicio ? dataInicio.slice(0, 19).replace("T", " ") : null, // Formata dataInicio
          dataPrevEntrega
            ? dataPrevEntrega.slice(0, 19).replace("T", " ")
            : null, // Formata dataPrevEntrega
          dataEntrega ? dataEntrega.slice(0, 19).replace("T", " ") : null, // Formata dataEntrega
          codStatus,
          nome,
          descricao,
          atividades,
          prioridade,
          solicitante,
          responsavel,
          codDisciplina,
          gut,
          gravidade,
          urgencia,
          tendencia,
          dataLiberacao ? dataLiberacao.slice(0, 19).replace("T", " ") : null, // Formata dataLiberacao
          relacionamento,
          fkCodCliente,
          fkCodColigada,
          valorFatDireto,
          valorServicoMO,
          valorServicoMatAplicado,
          valorMaterial,
          valorTotal,
          codSegmento,
          codCidade,
          valorLocacao,
          adicionalInsertResult.insertId,
          idProjeto,
          dataInteracao, // Presumindo que dataInteracao já está em formato correto ou não precisa de alteração
          valorFatDolphin,
          principal,
          valorComissao,
          idMotivoPerdido,
          observacoes,
          descricaoVenda,
          emailVendaEnviado,
        ]
      );
      const [adicional] = await this.executeQuery(
        `SELECT * FROM ADICIONAIS WHERE ID = ?`,
        [adicionalInsertResult.insertId]
      );

      return {
        adicional,
        codOs: result.insertId,
      };
    }

    const newProjectId = await ProjectService.createProject({
      descricao: nome,
    });
    const adicionalInsertResult = await this.executeQuery(
      OpportunityRepository.createAdicional(),
      [newProjectId, newProjectId]
    );
    const result = await this.executeQuery(
      OpportunityRepository.createOpportunityQuery(),
      [
        codOs,
        codTipoOs,
        codCCusto,
        obra,
        dataSolicitacao ? dataSolicitacao.slice(0, 19).replace("T", " ") : null, // Formata dataSolicitacao
        dataNecessidade ? dataNecessidade.slice(0, 19).replace("T", " ") : null, // Formata dataNecessidade
        docReferencia,
        listaMateriais,
        dataInicio ? dataInicio.slice(0, 19).replace("T", " ") : null, // Formata dataInicio
        dataPrevEntrega ? dataPrevEntrega.slice(0, 19).replace("T", " ") : null, // Formata dataPrevEntrega
        dataEntrega ? dataEntrega.slice(0, 19).replace("T", " ") : null, // Formata dataEntrega
        codStatus,
        nome,
        descricao,
        atividades,
        prioridade,
        solicitante,
        responsavel,
        codDisciplina,
        gut,
        gravidade,
        urgencia,
        tendencia,
        dataLiberacao ? dataLiberacao.slice(0, 19).replace("T", " ") : null, // Formata dataLiberacao
        relacionamento,
        fkCodCliente,
        fkCodColigada,
        valorFatDireto,
        valorServicoMO,
        valorServicoMatAplicado,
        valorMaterial,
        valorTotal,
        codSegmento,
        codCidade,
        valorLocacao,
        adicionalInsertResult.insertId,
        isAdicional ? idProjeto : newProjectId,
        dataInteracao, // Presumindo que dataInteracao já está em formato correto ou não precisa de alteração
        valorFatDolphin,
        principal,
        valorComissao,
        idMotivoPerdido,
        observacoes,
        descricaoVenda,
        emailVendaEnviado,
      ]
    );
    await this.handleComments(comentarios, result.insertId);
    await this.handleFollowers(seguidores, newProjectId);
    return {
      idAdicional: 0,
      codOs: result.insertId,
    };
  };

  static handleFollowers = async (seguidores, projectId) => {
    if (seguidores && seguidores.length) {
      const followersToBeInserted = await this.filterValidUsersTobeInserted(
        seguidores,
        projectId
      );

      if (followersToBeInserted && followersToBeInserted.length) {
        await Promise.all(
          followersToBeInserted.map(async (follower) =>
            this.executeQuery(OpportunityRepository.createFollowerQuery(), [
              follower.id_seguidor_projeto,
              follower.id_projeto,
              follower.codpessoa,
              follower.ativo,
            ])
          )
        );
      }
    }
    const newFollowersCodPessoalist = seguidores
      .map((seguidor) => seguidor.codpessoa)
      .join(",");
    if (newFollowersCodPessoalist && newFollowersCodPessoalist.length) {
      const deleteResult = await this.executeQuery(
        OpportunityRepository.deleteFollowersByProjectIdQuery(
          newFollowersCodPessoalist
        ),
        [projectId]
      );
    } else {
      const deleteResult = await this.executeQuery(
        OpportunityRepository.deleteAllfollowersByProjectId(),
        [projectId]
      );
    }
  };

  static filterValidUsersTobeInserted = async (seguidores, projectId) => {
    const databaseFollowersList = await this.executeQuery(
      OpportunityRepository.getAllFollowers()
    );
    return seguidores
      .map((newFollower) => ({
        ...newFollower,
        id_projeto: projectId,
      }))
      .filter((newFollower) => newFollower.id_seguidor_projeto === 0)
      .filter(
        (newFollower) =>
          !databaseFollowersList.find(
            (followerOnDb) =>
              followerOnDb.id_projeto === newFollower.id_projeto &&
              followerOnDb.codpessoa === newFollower.codpessoa
          )
      );
  };

  static updateOpportunity = async (oppId, opp, user) => {
    const { comentarios } = opp;
    await this.processComments(comentarios, oppId);

    const updatedOpportunity = await OpportunityRepository.updateOpportunity(
      oppId,
      opp,
      user
    );

    return updatedOpportunity;
  };

  static processComments = async (comentarios, oppId) => {
    const oldComments = await this.getCommentsByOpportunityId(oppId);
    const newComments = this.filterNewComments(oldComments, comentarios);
    const toUpdateComments = this.filterUpdatedComments(
      oldComments,
      comentarios
    );
    const toDeleteComments = this.filterDeletedComments(
      oldComments,
      comentarios
    );
    console.log("toUpdateComments", toUpdateComments);  
    console.log("toDeleteComments", toDeleteComments);
    console.log("newComments", newComments);

    if (toUpdateComments && toUpdateComments.length > 0) {
        for(const c of toUpdateComments) {
            await prisma.comentarios.update({
              where: {
                CODCOMENTARIO: c.CODCOMENTARIO,
              },
              data: c,
            });
        }
    }

    if (newComments && newComments.length > 0) {
      await prisma.comentarios.createMany({
      data: newComments.map((c) => {
        delete c.CODCOMENTARIO;
        return c;
      }),
      });
    }

    if (toDeleteComments && toDeleteComments.length > 0) {
      await prisma.comentarios.deleteMany({
      where: {
        CODCOMENTARIO: {
        in: toDeleteComments.map((c) => c.CODCOMENTARIO),
        },
      },
      });
    }
  };

  static filterUpdatedComments = (oldComments, commentsReceived) => {
    return commentsReceived.filter((newComment) => {
      const oldComment = oldComments.find(
        (oldComment) => oldComment.CODCOMENTARIO === newComment.CODCOMENTARIO
      );
      return (
        oldComment &&
        (oldComment.DESCRICAO !== newComment.DESCRICAO)
      );
    });
  };

  static filterNewComments = (oldComments, commnetsReceived) => {
    const newComments = commnetsReceived.filter(
      (comment) =>
        !oldComments.some(
          (oldComment) => oldComment.CODCOMENTARIO === comment.CODCOMENTARIO
        )
    );
    return newComments;
  };

  static filterDeletedComments = (oldComments, commentsReceived) => {
    return oldComments.filter(
      (oldComment) =>
        !commentsReceived.some(
          (newComment) => newComment.CODCOMENTARIO === oldComment.CODCOMENTARIO
        )
    );
  };

  static getCommentsByOpportunityId = async (oppId) => {
    return await prisma.comentarios.findMany({
      where: {
        CODOS: Number(oppId),
      },
    });
  };

  static sendSoldOpportunityEmail = async (
    codOs,
    newCodStatus,
    oldOpportunity,
    newOpportunity,
    user,
    manualSending
  ) => {
    const shouldSendEmail =
      (newCodStatus !== oldOpportunity.codStatus &&
        newOpportunity.codStatus === 11) ||
      manualSending;

    if (shouldSendEmail) {
      const [adicional] = await this.executeQuery(
        `SELECT ID, NUMERO FROM ADICIONAIS WHERE ID = ? LIMIT 1`,
        [oldOpportunity.idAdicional]
      );
      const [client] = await this.executeQuery(
        `SELECT NOMEFANTASIA as clientName FROM CLIENTE WHERE CODCLIENTE = ?`,
        [newOpportunity.fkCodCliente]
      );
      const isAdicional = adicional.NUMERO > 0 ? true : false;
      const htmlContent = OpportunityView.createSoldOppEmail(
        newOpportunity,
        user,
        client.clientName
      );
      try {
        if (isAdicional) {
          //cliente   //projeto.adicional
          await EmailService.sendEmail(
            "comuvendas@dse.com.br",
            `Adicional Vendido: ${client.clientName} - ${newOpportunity.idProjeto}.${newOpportunity.numeroAdicional} - ${newOpportunity.nome}`,
            "",
            htmlContent,
            ["ti.dse01@dse.com.br"]
          );
        }
        if (!isAdicional) {
          await EmailService.sendEmail(
            "comuvendas@dse.com.br",
            `Projeto Vendido: ${client.clientName} - ${newOpportunity.idProjeto}.${newOpportunity.numeroAdicional} - ${newOpportunity.nome}`,
            "",
            htmlContent,
            ["ti.dse01@dse.com.br"]
          );
        }
      } catch (e) {
        throw new Error(e);
      }
      return;
    }
  };

  static handleFiles = async (filesReceived, oppId) => {
    const oppFiles = await this.executeQuery(
      OpportunityRepository.getOppFilesQuery(),
      [oppId]
    );
    if (oppFiles.length) {
      const filesToDelete = oppFiles.filter(
        (oppFile) =>
          !filesReceived.find(
            (fileReceived) => fileReceived.id_anexo_os === oppFile.id_anexo_os
          )
      );
      if (filesToDelete.length) {
        const idsToDeleteString = `(${filesToDelete
          .map((file) => file.id_anexo_os) // Extrai o id_anexo_os de cada item
          .join(",")})`;

        await this.executeQuery(
          OpportunityRepository.deleteOppFilesQuery(idsToDeleteString)
        );
      }
    }
  };

  static getOppStatusList = async () => {
    return await OpportunityRepository.getOppStatusList();
  };

  static getOpportunities = async (req) => {
    return await OpportunityRepository.getOppornities(req.query);
  };

  static async executeQuery(query, params) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(query, params);
      connection.release();
      return result;
    } catch (queryError) {
      connection.release();
      throw queryError;
    }
  }

  static async sendSalesReportEmail(oppsByResponsable) {
    try {
      for (let map of oppsByResponsable) {
        const htmlContent = this.createSalesEmail(
          map.NOME,
          map.expiredOpportunities,
          map.toExpireOpportunities
        );
        await EmailService.sendEmail(
          map.EMAIL,
          "Relatório Semanal de Oportunidades",
          "",
          htmlContent,
          ["ti.dse@gmail.com"]
        );
      }
    } catch (e) {
      console.log(e);
    }
  }

  static createSalesEmail = (responsableName, expiredOpps, toExpireOpps) => {
    const columns = [
      { header: "Projeto", key: "ID_PROJETO" },
      { header: "Nº Adicional", key: "ADICIONAL" },
      { header: "Tarefa", key: "NOME" },
      { header: "Valor Dolphin (R$)", key: "VALORFATDOLPHIN" },
      { header: "Valor Direto (R$)", key: "VALORFATDIRETO" },
      { header: "Valor Total (R$)", key: "VALORTOTAL" },
    ];

    return `
     <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          h2 {
            color: #2c3e50;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            color: #333;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
          }
          .no-data {
            font-style: italic;
            color: #777;
          }
        </style>
      </head>
      <body>
        <h2>Relatório Semanal de Oportunidades</h2>
        <p>Olá, <strong>${responsableName}</strong>,</p>
        <p>Segue o relatório semanal das oportunidades vencidas e que estão prestes a vencer:</p>

        <!-- Oportunidades Expiradas -->
        <h3>Oportunidades Expiradas</h3>
        ${
          expiredOpps
            ? `
          <table>
            <thead>
              <tr>
                ${columns
                  .map(
                    (column) => `
                  <th>${column.header}</th>
                `
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${expiredOpps
                .map(
                  (opp) => `
                <tr>
                  ${columns
                    .map(
                      (column) => `
                    <td>${opp[column.key]}</td>
                  `
                    )
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `
            : `
          <p class="no-data">Não há oportunidades expiradas.</p>
        `
        }

        <!-- Oportunidades que Expirarão Esta Semana -->
        <h3>Oportunidades que Expirarão Esta Semana</h3>
        ${
          toExpireOpps
            ? `
         <table>
                <thead>
                  <tr>
                    ${columns
                      .map(
                        (column) => `
                      <th>${column.header}</th>
                    `
                      )
                      .join("")}
                  </tr>
                </thead>
                <tbody>
                  ${expiredOpps
                    .map(
                      (opp) => `
                    <tr>
                      ${columns
                        .map(
                          (column) => `
                        <td>${opp[column.key]}</td>
                      `
                        )
                        .join("")}
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
        </table>
        `
            : `
          <p class="no-data">Não há oportunidades prestes a expirar.</p>
        `
        }
        <p>Atenciosamente,</p>
        <p><strong>Setor de TI</strong></p>

        <div class="footer">
          <p>Por favor, não responder a este e-mail. Em caso de dúvidas, entre em contato com o suporte técnico.</p>
        </div>
      </body>
    </html>
  `;
  };

  static sendManagerOppExpirationEmail = async (oppsByManager) => {
    try {
      for (let map of oppsByManager) {
        if (map.expiredOpportunities || map.toExpireOpportunities) {
          const htmlContent = this.createManagerOppExpirationEmail(
            map.NOME,
            map.expiredOpportunities,
            map.toExpireOpportunities
          );
          await EmailService.sendEmail(
            map.EMAIL,
            "Relatório Semanal de Oportunidades",
            "",
            htmlContent,
            ["ti.dse@gmail.com"]
          );
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  static createManagerOppExpirationEmail = (
    managerName,
    expiredOpps,
    toExpireOpps
  ) => {
    const columns = [
      { header: "Projeto", key: "ID_PROJETO" },
      { header: "Nº Adicional", key: "ADICIONAL" },
      { header: "Tarefa", key: "NOME" },
      { header: "Valor Dolphin (R$)", key: "VALORFATDOLPHIN" },
      { header: "Valor Direto (R$)", key: "VALORFATDIRETO" },
      { header: "Valor Total (R$)", key: "VALORTOTAL" },
    ];

    return `
    <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      h2 {
        color: #2c3e50;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
        color: #333;
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #777;
      }
      .no-data {
        font-style: italic;
        color: #777;
      }
    </style>
  </head>
  <body>
    <h2>Relatório Semanal de Oportunidades</h2>
    <p>Olá, <strong>${managerName}</strong>,</p>
    <p>Segue o relatório semanal das oportunidades vencidas e que estão prestes a vencer sob sua gestão:</p>

    <!-- Oportunidades Expiradas -->
    <h3>Oportunidades Expiradas</h3>
    ${
      expiredOpps
        ? `
          <table>
        <thead>
          <tr>
            ${columns
              .map(
                (column) => `
              <th>${column.header}</th>
            `
              )
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${expiredOpps
            .map(
              (opp) => `
            <tr>
              ${columns
                .map(
                  (column) => `
                <td>${opp[column.key]}</td>
              `
                )
                .join("")}
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `
        : `
      <p class="no-data">Não há oportunidades expiradas.</p>
    `
    }

    <!-- Oportunidades que Expirarão Esta Semana -->
    <h3>Oportunidades que Expirarão Esta Semana</h3>
    ${
      toExpireOpps
        ? `
    <table>
            <thead>
              <tr>
                ${columns
                  .map(
                    (column) => `
                  <th>${column.header}</th>
                `
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${expiredOpps
                .map(
                  (opp) => `
                <tr>
                  ${columns
                    .map(
                      (column) => `
                    <td>${opp[column.key]}</td>
                  `
                    )
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
      </table>
    `
        : `
      <p class="no-data">Não há oportunidades prestes a expirar.</p>
    `
    }

    <p>Atenciosamente,</p>
    <p><strong>Setor de TI</strong></p>

    <div class="footer">
      <p>Por favor, não responder a este e-mail. Em caso de dúvidas, entre em contato com o suporte técnico.</p>
    </div>
  </body>
</html>
    `;
  };

  static getOppsByComercialResponsable = async () => {
    try {
      const oppsByResponsableMap = await this.executeQuery(
        OpportunityRepository.getOppsByComercialResponsableQuery()
      );
      return oppsByResponsableMap;
    } catch (e) {
      throw new Error(e);
    }
  };

  static getOppsByManager = async () => {
    try {
      const oppsByManager = await this.executeQuery(
        OpportunityRepository.getOppsByManagerQuery()
      );
      return oppsByManager;
    } catch (e) {
      throw new Error(e);
    }
  };
}

module.exports = OpportunityService;
