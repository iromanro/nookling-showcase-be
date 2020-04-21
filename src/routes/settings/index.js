const express = require('express');
const router = express.Router();
const controller  = require('./controller');
const authenticate = require('../../middlewear/authenticate');

router.get('/', authenticate, controller.getUserSettings);
router.put('/', authenticate, controller.updateUserSettings);

module.exports = router;
