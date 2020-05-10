const express = require('express');
const controller = require('./controller');
const authenticate = require('../../middlewear/authenticate');

const router = express.Router();

// router.post('/', authenticate, controller.createDesign);
router.get('/item/:term', authenticate, controller.findItem);

module.exports = router;
