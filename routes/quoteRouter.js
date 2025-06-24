
var express = require("express");
var router = express.Router();

const QuoteController = require("../controllers/QuoteController");

router.get("/", QuoteController.getMany);
router.get("/:id_cotacao", QuoteController.getById);
router.post("/", QuoteController.create);
router.put("/:id_cotacao", QuoteController.update);
router.delete("/:id_cotacao", QuoteController.delete);

module.exports = router;
