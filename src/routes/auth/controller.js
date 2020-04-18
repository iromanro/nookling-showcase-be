// const express = require('express');
const request = require('request');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const uuidv4 = require('uuid/v4');
const ObjectId = require('mongoose').Types.ObjectId;
const db = require('../../db.js');
//const config = require('../../../config.js');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '/Users/topnotch/Desktop/Streaminions/streaminions-app/server/.env' });
}

function discordLogin(req, res) {
  let code = req.body.code;

  axios({
    method: "POST",
    url: `https://discordapp.com/api/v6/oauth2/token`,
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: qs.stringify({
      client_id: "700548602799325245",
      client_secret: "xRhj4nGbQqaDiCju_WZVULjD3d-T6CPD",
      grant_type: "authorization_code",
      code: code,
      redirect_uri: "https://www.nooklingshowcase.com/auth",
      scope: "identify em ail",
    }),
  }).then((response) => {
    findUser(response.data);
  }).catch((error) => {
    if (error.response.status === 400) {
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

      res.status(200).send({
        success: true,
        message: "FOUND THE USER",
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

function createDefault(req, res, id, token) {


  db.get().collection('UserMinion').insertOne(minion, (err, minion) => {
    if (err) return res.status(404).send({ success: 'false', message: 'Error creating minion!' });
  });

  db.get().collection('Commands').insertMany([subCommand, resubCommand, giftSubCommand, hostCommand, raidCommand, cheerCommand], (err, commands) => {
    if (err) return res.status(404).send({ success: 'false', message: 'Error creating default commands!' });

    return res.status(201).send({ success: true, jwt: token });
  });
}

module.exports = {
  twitchLogin,
  createDefault,
};