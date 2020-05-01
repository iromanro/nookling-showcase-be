const express = require('express');

const router = express.Router();
const controller = require('./controller');
const authenticate = require('../../middlewear/authenticate');

router.post('/', authenticate, controller.createPost);

module.exports = router;
