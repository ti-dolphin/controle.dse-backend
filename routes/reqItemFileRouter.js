var express = require("express");
var router = express.Router();
const ReqItemFileController = require("../controllers/ReqItemFileController");

router.get("/:id_item_requisicao", ReqItemFileController.getByRequisitionItem);
router.get("/:id_anexo_item_req", ReqItemFileController.getById);
router.post("/", ReqItemFileController.create);
router.put("/:id_anexo_item_req", ReqItemFileController.update);
router.delete("/:id_anexo_item_requisicao", ReqItemFileController.delete);

module.exports = router;
