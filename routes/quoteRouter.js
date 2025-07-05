
var express = require("express");
var router = express.Router();

const QuoteController = require("../controllers/QuoteController");
const { resourcesettings } = require("googleapis/build/src/apis/resourcesettings");

router.get("/", QuoteController.getMany);
router.get("/:id_cotacao", QuoteController.getById);
router.get("/cf/classificacoes-fiscais", QuoteController.getTaxClassifications);
router.get("/cp/condicoes-pagamento", QuoteController.getPaymentConditions);
router.get('/tf/tipos-frete', QuoteController.getShipmentTypes);
router.post("/", QuoteController.create);
router.put("/:id_cotacao", QuoteController.update);
router.delete("/:id_cotacao", QuoteController.delete);

module.exports = router;
