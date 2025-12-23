const { prisma } = require("../database");
const { getNowISODate } = require("../utils");

class NotificationRepository {
  buildInclude = () => ({
    WEB_REQUISICAO: {
      select: {
        ID_REQUISICAO: true,
        DESCRIPTION: true,
      },
    },
    PESSOA_web_avisos_sino_id_usuario_remetenteToPESSOA: {
      select: {
        CODPESSOA: true,
        NOME: true,
      },
    },
    web_status_requisicao_web_avisos_sino_id_status_anteriorToweb_status_requisicao: {
      select: {
        id_status_requisicao: true,
        nome: true,
      },
    },
    web_status_requisicao_web_avisos_sino_id_status_novoToweb_status_requisicao: {
      select: {
        id_status_requisicao: true,
        nome: true,
      },
    },
  });

  formatNotification = (notification) => {
    if (!notification) return null;

    return {
      id_aviso: notification.id_aviso,
      id_requisicao: notification.id_requisicao,
      id_usuario_destinatario: notification.id_usuario_destinatario,
      id_usuario_remetente: notification.id_usuario_remetente,
      id_status_anterior: notification.id_status_anterior,
      id_status_novo: notification.id_status_novo,
      nome_transicao: notification.nome_transicao,
      visto: notification.visto,
      data_criacao: notification.data_criacao,
      data_visto: notification.data_visto,
      requisicao: notification.WEB_REQUISICAO
        ? {
            id: notification.WEB_REQUISICAO.ID_REQUISICAO,
            descricao: notification.WEB_REQUISICAO.DESCRIPTION,
          }
        : null,
      remetente: notification.PESSOA_web_avisos_sino_id_usuario_remetenteToPESSOA
        ? {
            id: notification.PESSOA_web_avisos_sino_id_usuario_remetenteToPESSOA.CODPESSOA,
            nome: notification.PESSOA_web_avisos_sino_id_usuario_remetenteToPESSOA.NOME,
          }
        : null,
      status_anterior: notification.web_status_requisicao_web_avisos_sino_id_status_anteriorToweb_status_requisicao
        ? {
            id: notification.web_status_requisicao_web_avisos_sino_id_status_anteriorToweb_status_requisicao.id_status_requisicao,
            nome: notification.web_status_requisicao_web_avisos_sino_id_status_anteriorToweb_status_requisicao.nome,
          }
        : null,
      status_novo: notification.web_status_requisicao_web_avisos_sino_id_status_novoToweb_status_requisicao
        ? {
            id: notification.web_status_requisicao_web_avisos_sino_id_status_novoToweb_status_requisicao.id_status_requisicao,
            nome: notification.web_status_requisicao_web_avisos_sino_id_status_novoToweb_status_requisicao.nome,
          }
        : null,
    };
  };

  async findUnseenByUser(userId) {
    const notifications = await prisma.web_avisos_sino.findMany({
      where: {
        id_usuario_destinatario: Number(userId),
        visto: false,
      },
      include: this.buildInclude(),
      orderBy: {
        data_criacao: "desc",
      },
    });

    return notifications.map((notification) =>
      this.formatNotification(notification)
    );
  }

  async countUnseenByUser(userId) {
    return await prisma.web_avisos_sino.count({
      where: {
        id_usuario_destinatario: Number(userId),
        visto: false,
      },
    });
  }

  async create(data, tx = prisma) {
    const notification = await tx.web_avisos_sino.create({
      data: {
        ...data,
        data_criacao: getNowISODate(),
      },
      include: this.buildInclude(),
    });

    return this.formatNotification(notification);
  }

  async markAsSeen(id_aviso) {
    const notification = await prisma.web_avisos_sino.update({
      where: {
        id_aviso: Number(id_aviso),
      },
      data: {
        visto: true,
        data_visto: getNowISODate(),
      },
      include: this.buildInclude(),
    });

    return this.formatNotification(notification);
  }

  async markAllAsSeenByUser(userId) {
    await prisma.web_avisos_sino.updateMany({
      where: {
        id_usuario_destinatario: Number(userId),
        visto: false,
      },
      data: {
        visto: true,
        data_visto: getNowISODate(),
      },
    });

    return { success: true };
  }
}

module.exports = new NotificationRepository();
