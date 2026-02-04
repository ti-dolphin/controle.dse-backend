var express = require('express');
var router = express.Router();
const NotesController = require('../controllers/NotesController');

router.get('/', NotesController.getMany);
router.get('/ponto', NotesController.getManyPonto);

module.exports = router;  