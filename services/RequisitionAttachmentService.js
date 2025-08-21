class RequisitionAttachmentService {
  // ...existing code...

  async cloneAttachments(originalRequisitionId, newRequisitionId, tx) {
    const attachments = await tx.web_anexos_requisicao.findMany({
      where: { id_requisicao: originalRequisitionId },
    });
    if (!attachments.length) {
      return;
    }
    await tx.web_anexos_requisicao.createMany({
      data: attachments.map(({ id, ...rest }) => ({
        ...rest,
        id_requisicao: newRequisitionId,
      })),
    });
    console.log("📎 Anexos clonados:", attachments.length);
  }

  // ...existing code...
}

module.exports = new RequisitionAttachmentService();