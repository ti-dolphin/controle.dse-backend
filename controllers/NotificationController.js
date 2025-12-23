const NotificationService = require("../services/NotificationService");

class NotificationController {
  async getUnseen(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "userId é obrigatório" });
      }

      const notifications = await NotificationService.getUnseenByUser(userId);

      res.status(200).json(notifications);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getUnseenCount(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "userId é obrigatório" });
      }

      const count = await NotificationService.getUnseenCount(userId);

      res.status(200).json({ count });
    } catch (error) {
      console.error("Erro ao contar notificações:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async markAsSeen(req, res) {
    try {
      const { id_aviso } = req.params;

      if (!id_aviso) {
        return res.status(400).json({ error: "id_aviso é obrigatório" });
      }

      const notification = await NotificationService.markAsSeen(id_aviso);

      res.status(200).json(notification);
    } catch (error) {
      console.error("Erro ao marcar notificação como vista:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async markAllAsSeen(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "userId é obrigatório" });
      }

      const result = await NotificationService.markAllAsSeen(userId);

      res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao marcar todas notificações como vistas:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new NotificationController();
