var express = require("express");
var router = express.Router();
const QuoteItemController = require("../controllers/QuoteItemController");

router.get("/", QuoteItemController.getMany);
router.get("/:id_item_cotacao", QuoteItemController.getById);
router.post("/", QuoteItemController.create);
router.put("/:id_item_cotacao", QuoteItemController.update);
router.delete("/:id_item_cotacao", QuoteItemController.delete);

module.exports = router;