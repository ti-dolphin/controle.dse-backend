const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');

router.get('/:userId', NotificationController.getUnseen);

router.get('/:userId/count', NotificationController.getUnseenCount);

router.patch('/:id_aviso/seen', NotificationController.markAsSeen);

router.patch('/:userId/seen-all', NotificationController.markAllAsSeen);

module.exports = router;
