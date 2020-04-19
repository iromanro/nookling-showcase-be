const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const auth = require('./routes/auth/index.js');

const app = express();
const router = express.Router();
const port = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '/Users/topnotch/Desktop/Streaminions/streaminions-app/server/.env' });
}

const allowedOrigins = ['https://nookling-showcase-fe.herokuapp.com', 'https://www.nooklingshowcase.com']
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }

    // console.log("origin: ", origin);
    // if (allowedOrigins.indexOf(origin) !== -1) {
    //   callback(null, true)
    // } else {
    //   callback(new Error('Not allowed by CORS'))
    // }
  },
  method: ['GET', 'PUT', 'POST', 'DELETE', 'UPDATE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Authorization', 'Origin', 'OK', 'X-Requested-With', 'Content-Type', 'Accept'],
  credentials: true,
}));

app.use((req, res, next) => {
  // console.log(allowedOrigins);
  if (allowedOrigins.includes(req.headers.origin)) {
    console.log("CORS IS OK");
    res.append('Access-Control-Allow-Origin', req.headers.origin)
  }
  // console.log(res.headers);
  // const origin = req.headers.origin;
  // console.log("Origin: ", origin);
  // let originSet = false;
  // if (allowedOrigins.indexOf(req.headers.origin) !== -1 && !originSet) {
  //   res.append('Access-Control-Allow-Origin', req.headers.origin);
  //   originSet = true;
  // }
  //res.append('Access-Control-Allow-Origin', req.headers.origin);
  res.append('Access-Control-Allow-Credentials', true);
  res.append('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, UPDATE, OPTIONS, PATCH')
  res.append('Access-Control-Allow-Headers', 'Authorization, Origin, OK, X-Requested-With, Content-Type, Accept')
  res.append('Content-Type', 'application/json')

  next();
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json({
  verify: (req, res, buf, encoding) => {
    //Check is hub signature is in the headers
    if (req.headers && req.headers['x-hub-signature']) {
      //Split the signature
      const xHub = req.headers['x-hub-signature'].split('=')

      //Get the hex for the signature from twitch and store it in the req
      req.twitch_hex = crypto.createHmac(xHub[0], process.env.SUB_SECRET).update(buf).digest('hex')
      req.twitch_signature = xHub[1];
    }
  },
}));

// app.use('/', routes);
app.use('/api/v1/auth', auth);

app.listen(port, () => console.log(`Listening on port ${port}`));
