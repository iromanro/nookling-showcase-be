const express = require('express');
const router = express.Router();
const controller  = require('./controller');
const authenticate = require('../../middlewear/authenticate');

router.get('/:uuid', controller.getUserProfile);
router.get('/', authenticate, controller.getUserProfile);

module.exports = router;
