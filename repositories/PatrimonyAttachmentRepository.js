const { prisma } = require("../database");

class PatrimonyAttachmentRepository {

  formatAttachment(attachment) {
    if (!attachment) return null;
    
    return {
      ...attachment,
    };
  }

  async create(payload) {
    const attachment = await prisma.web_anexos_patrimonio.create({
      data: {
        nome_arquivo: payload.nome_arquivo,
        arquivo: payload.arquivo,
        web_patrimonio: {
          connect: {
            id_patrimonio: Number(payload.id_patrimonio)
          }
        },
      },
    });
    return this.formatAttachment(attachment);
  }

  async getMany(id_patrimonio) {
    const attachments = await prisma.web_anexos_patrimonio.findMany({
      where: { id_patrimonio: Number(id_patrimonio) },
    });
    return attachments.map(this.formatAttachment);
  }

  async getById(id_anexo_patrimonio) {
    const attachment = await prisma.web_anexos_patrimonio.findUnique({
      where: { id_anexo_patrimonio: Number(id_anexo_patrimonio) },
    });
    return this.formatAttachment(attachment);
  }

  async delete(id_anexo_patrimonio) {
    return await prisma.web_anexos_patrimonio.delete({
      where: { id_anexo_patrimonio: Number(id_anexo_patrimonio) },
    });
  }
}

module.exports = new PatrimonyAttachmentRepository();
