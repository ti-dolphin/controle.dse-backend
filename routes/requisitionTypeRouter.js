const express = require('express');
const RequisitionTypeController = require('../controllers/RequisitionTypeController');

const router = express.Router();

// Get all requisition types
router.get('/', RequisitionTypeController.getMany);

// Get requisition type by ID
router.get('/:id_tipo_requisicao', RequisitionTypeController.getById);

// Create a new requisition type
router.post('/', RequisitionTypeController.Create);

// Update a requisition type by ID
router.put('/:id_tipo_requisicao', RequisitionTypeController.Update);

// Delete a requisition type by ID
router.delete('/:id_tipo_requisicao', RequisitionTypeController.Delete);

module.exports = router;