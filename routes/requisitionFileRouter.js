const express = require('express');
const RequisitionFileController = require('../controllers/RequisitionFileController');

const router = express.Router();

// GET /requisition-files
router.get('/', (req, res) => RequisitionFileController.getMany(req, res));

// GET /requisition-files/:id
router.get('/:id', (req, res) => RequisitionFileController.getById(req, res));

// POST /requisition-files
router.post('/', (req, res) => RequisitionFileController.create(req, res));

// PUT /requisition-files/:id
router.put('/:id', (req, res) => RequisitionFileController.update(req, res));

// DELETE /requisition-files/:id
router.delete('/:id', (req, res) => RequisitionFileController.delete(req, res));

module.exports = router;