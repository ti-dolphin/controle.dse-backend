var express = require('express');
var router = express.Router();
const NotesController = require('../controllers/NotesController');

router.get('/', NotesController.getMany);

module.exports = router;  