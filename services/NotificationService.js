const NotificationRepository = require("../repositories/NotificationRepository");
const { prisma } = require("../database");

class NotificationService {
  async getUnseenByUser(userId) {
    if (!userId) {
      throw new Error("userId é obrigatório");
    }

    return await NotificationRepository.findUnseenByUser(userId);
  }

  async getUnseenCount(userId) {
    if (!userId) {
      throw new Error("userId é obrigatório");
    }

    return await NotificationRepository.countUnseenByUser(userId);
  }

  async markAsSeen(id_aviso) {
    if (!id_aviso) {
      throw new Error("id_aviso é obrigatório");
    }

    return await NotificationRepository.markAsSeen(id_aviso);
  }

  async markAllAsSeen(userId) {
    if (!userId) {
      throw new Error("userId é obrigatório");
    }

    return await NotificationRepository.markAllAsSeenByUser(userId);
  }

  async createNotification(
    requisitante,
    alterado_por,
    id_requisicao,
    id_status_anterior,
    id_status_novo,
    tx = prisma
  ) {
    // Não notifica se o próprio requisitante está alterando o status
    if (Number(requisitante) === Number(alterado_por)) {
      console.log("Não criando notificação: auto-alteração de status");
      return null;
    }

    // Busca a transição na tabela web_transicao_status
    const transicao = await tx.web_transicao_status.findUnique({
      where: {
        id_status_anterior_id_status_requisicao: {
          id_status_anterior: Number(id_status_anterior),
          id_status_requisicao: Number(id_status_novo),
        },
      },
    });

    // Se não encontrou a transição, não cria notificação
    if (!transicao) {
      console.log(
        `Transição não encontrada: ${id_status_anterior} -> ${id_status_novo}`
      );
      return null;
    }

    console.log(`Criando notificação: ${transicao.nome_transicao} - Req ${id_requisicao}`);

    // Cria a notificação para o requisitante
    const notificationData = {
      id_requisicao: Number(id_requisicao),
      id_usuario_destinatario: Number(requisitante),
      id_usuario_remetente: Number(alterado_por),
      id_status_anterior: Number(id_status_anterior),
      id_status_novo: Number(id_status_novo),
      nome_transicao: transicao.nome_transicao,
      visto: false,
    };

    return await NotificationRepository.create(notificationData, tx);
  }
}

module.exports = new NotificationService();
