const jwt = require('jsonwebtoken');
const db = require('../db.js');
//const userController = require('../routes/user/controller.js');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '/Users/topnotch/Desktop/Streaminions/streaminions-app/server/.env' });
}

async function checkAuthentication(req, res, next) {
  const authorizationHeader = req.headers['authorization'];
  let token;

  if (authorizationHeader) {
    token = authorizationHeader.split(' ')[1];
  }

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(403).json({ success: false, message: 'Unauthorized. Token has expired.' });
        } else {
          return res.status(401).json({ success: false, message: 'Unauthorized. Invalid token.' });
        }
      }

      db.get().collection('users').findOne({ uuid: decoded.uuid }, (userErr, user) => {
        if (userErr) { return res.status(404).json({ success: false, message: 'User not found.' }); }

        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found.' });
        }

        req.decoded = decoded;
        next();
      });
    });
  } else {
    return res.status(403).json({ success: false, message: 'Unauthorized. No token provided.' });
  }
}

async function reauthorizeUser(req, res, next) {
  const newToken = await getNewToken(req);

  if (newToken) {
    res.cookie('jwt', newToken);
    next();
  } else {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
}

function getNewToken(req) {
  return new Promise((resolve) => {
    setTimeout(() => {
      db.get().collection('Users').findOne({ uuid: req.params.uuid }, (err, user) => {
        if (err) resolve(null);
    
        const userJWT = {
          uuid: user.uuid,
          username: user.username,
        };

        const token = jwt.sign(userJWT, process.env.JWT_SECRET, { expiresIn: 60 * 60 * process.env.JWT_HOURS });
        resolve(token);
      });
    }, 2000);
  });
}

module.exports = checkAuthentication;
