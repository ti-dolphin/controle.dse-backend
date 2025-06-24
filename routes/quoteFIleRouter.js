//quoteFileRouter

var express = require('express');
var router = express.Router();
const QuoteFileController = require('../controllers/QuoteFileController');

router.get('/', QuoteFileController.getMany);
router.get('/:id_anexo_cotacao', QuoteFileController.getById);
router.post('/', QuoteFileController.create);
router.put("/:id_anexo_cotacao", QuoteFileController.update);
router.delete("/:id_anexo_cotacao", QuoteFileController.delete);

module.exports = router;