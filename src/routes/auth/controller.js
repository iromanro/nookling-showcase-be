// const express = require('express');
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const qs = require('query-string')
const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const ObjectId = require('mongoose').Types.ObjectId
const db = require('../../db.js')
//const config = require('../../../config.js');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '/Users/topnotch/Desktop/Streaminions/streaminions-app/server/.env' });
}

function discordLogin(req, res) {
  let code = req.body.code;
  console.log("Code: ", code);

  axios({
    method: "POST",
    url: `https://discordapp.com/api/v6/oauth2/token`,
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: qs.stringify({
      client_id: "700548602799325245",
      client_secret: "xRhj4nGbQqaDiCju_WZVULjD3d-T6CPD",
      grant_type: "authorization_code",
      code: code,
      redirect_uri: `${process.env.BASE_URL}/auth`,
      scope: "identify email",
    }),
  }).then((response) => {
    findUser(response.data);
  }).catch((error) => {
    if (error.response.status === 400) {
      console.log("error: ", error.response.data)
      return res.status(error.response.status).send({
        success: false,
        message: error.response.data.message,
      });
    }
  });

  function findUser(userSession) {
    axios({
      method: "GET",
      url: `https://discordapp.com/api/v6/users/@me`,
      headers: { Authorization: `Bearer ${userSession.access_token}` },
    }).then((discordUser) => {
      console.log("Discord user: ", discordUser.data.email)

      db.get().collection('users').findOne({ email: discordUser.data.email }, (userErr, user) => {
        if (userErr) return res.status(404).send({ success: false, message: "Unable to find user!"})

        if (!user) {
          const userDoc = {
            username: discordUser.data.username,
            discriminator: discordUser.data.discriminator,
            email: discordUser.data.email,
            avatar: discordUser.data.avatar,
            uuid: uuidv4(),
          }

          db.get().collection('users').insertOne(userDoc, (newUserErr, newUser) => {
            if (newUserErr) return res.status(404).send({ success: false, message: "Unable to create new user!"})
            
            const userJWT = {
              uuid: newUser.ops[0].uuid,
              username: newUser.ops[0].username,
              discriminator: newUser.ops[0].discriminator,
            }

            let token = jwt.sign(userJWT, process.env.JWT_SECRET, { expiresIn: 60 * 60 * process.env.JWT_HOURS })
            res.cookie('jwt', token)
            res.status(200).send({
              success: true,
              jwt: token,
            })
          })
        } else {
          console.log("User: ", user);
          const userJWT = {
            uuid: user.uuid,
            username: user.username,
            discriminator: user.discriminator,
          }

          let token = jwt.sign(userJWT, process.env.JWT_SECRET, { expiresIn: 60 * 60 * process.env.JWT_HOURS })
          res.cookie('jwt', token)
          res.status(200).send({
            success: true,
            jwt: token,
          })
        }
      })
      // db.get().collection('Users').findOne({ username: response.data.name }, (err, user) => {
      //   if (err) return res.status(500).send({ success: false, message: "Server error"})

      //   if (!user) {
      //     const doc = {
      //       uuid: uuidv4(),
      //       token: userSession.access_token,
      //       refresh_token: userSession.refresh_token,
      //       coins: 0,
      //       treats: 0,
      //       role: '',
      //       twitch_id: response.data._id,
      //       display_name: response.data.display_name,
      //       username: response.data.name,
      //       profile_image: response.data.logo,
      //       email: response.data.email,
      //       referral_key: response.data.name,
      //     };

      //     db.get().collection('Users').insertOne(doc, (err, response) => {
      //       if (err) return res.status(404).send({ success: false, message: 'Unable to create user' });

      //       const userJWT = {
      //         uuid: response.ops[0].uuid,
      //         username: response.ops[0].username,
      //       };

      //       let token = jwt.sign(userJWT, process.env.JWT_SECRET, { expiresIn: 60 * 60 * process.env.JWT_HOURS });
      //       res.cookie('jwt', token);
      //       createDefault(req, res, response.ops[0]._id, token);
      //     });
      //   } else {

      //     let role = '';
      //     if (user.role) {
      //       role = user.role;
      //     }
          
      //     const userJWT = {
      //       uuid: user.uuid,
      //       username: user.username,
      //       role,
      //     };

      //     let token = jwt.sign(userJWT, process.env.JWT_SECRET, { expiresIn: 60 * 60 * process.env.JWT_HOURS });
      //     res.cookie('jwt', token);

      //     db.get().collection('Users').updateOne({ uuid: user.uuid }, {
      //       $currentDate: {
      //         lastModified: true,
      //         'last_log_in': { $type: "date" }
      //       },
      //       $set: {
      //         token: userSession.access_token,
      //         refresh_token: userSession.refresh_token,
      //       },
      //     }, (err, updatedUser) => {
      //       return res.status(200).send({ success: true, jwt: token });
      //     });
      //   }
      // });
    }).catch((error) => {
      console.log(error);
    });
  }
}

module.exports = {
  discordLogin,
};
