const express = require('express');
const router = express.Router();
const controller  = require('./controller');

router.post('/discord', controller.discordLogin);
router.post('/google', controller.googleLogin);
router.post('/email/register', controller.emailRegistration);
router.post('/email/login', controller.emailLogin);


module.exports = router;
