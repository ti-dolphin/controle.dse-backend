var express = require('express');
var router = express.Router();
const NotesController = require('../controllers/NotesController');

router.get('/', NotesController.getMany);
router.get('/ponto', NotesController.getManyPonto);
router.get('/problema', NotesController.getManyProblema);
router.get('/centro-custos', NotesController.getCentroCustos);
router.get('/status-apontamento', NotesController.getStatusApontamento);
router.get('/lideres', NotesController.getLideres);
router.put('/batch', NotesController.updateBatch);

module.exports = router;  