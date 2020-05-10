/* eslint-disable consistent-return */
/* eslint-disable import/no-dynamic-require */
// const express = require('express');
const jwt = require('jsonwebtoken');
const qs = require('query-string');
const axios = require('axios');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const db = require('../../db.js');

const serviceAccount = require(`${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://nookling-showcase.firebaseio.com',
  storageBucket: process.env.STORAGE_BUCKET,
});

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '/Users/topnotch/Desktop/Streaminions/streaminions-app/server/.env' });
}

function discordLogin(req, res) {
  const { code } = req.body;

  function findUser(userSession) {
    axios({
      method: 'GET',
      url: 'https://discordapp.com/api/v6/users/@me',
      headers: { Authorization: `Bearer ${userSession.access_token}` },
    }).then((discordUser) => {
      db.get().collection('users').findOne({ email: discordUser.data.email }, (userErr, user) => {
        if (userErr) return res.status(404).send({ success: false, message: 'Unable to find user!' });

        if (!user) {
          const userDoc = {
            username: discordUser.data.username,
            discriminator: discordUser.data.discriminator,
            display_name: '',
            email: discordUser.data.email,
            avatar: discordUser.data.avatar,
            uuid: uuidv4(),
            twitter: '',
            instagram: '',
            switch_friend_code: '',
            discord_sync: true,
            hide_discord: true,
          };

          db.get().collection('users').insertOne(userDoc, (newUserErr, newUser) => {
            if (newUserErr) return res.status(404).send({ success: false, message: 'Unable to create new user!' });

            const userJWT = {
              uuid: newUser.ops[0].uuid,
              username: newUser.ops[0].username,
              discriminator: newUser.ops[0].discriminator,
            };

            const token = jwt.sign(userJWT, process.env.JWT_SECRET,
              { expiresIn: 60 * 60 * process.env.JWT_HOURS });
            res.cookie('jwt', token);
            res.status(200).send({
              success: true,
              jwt: token,
            });
          });
        } else {
          const userJWT = {
            uuid: user.uuid,
            username: user.username,
            discriminator: user.discriminator,
          };

          const token = jwt.sign(userJWT, process.env.JWT_SECRET,
            { expiresIn: 60 * 60 * process.env.JWT_HOURS });
          res.cookie('jwt', token);
          res.status(200).send({
            success: true,
            jwt: token,
          });
        }
      });
    }).catch((error) => {
      console.log(error);
    });
  }

  axios({
    method: 'POST',
    url: 'https://discordapp.com/api/v6/oauth2/token',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_SECRET_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.BASE_URL}/auth`,
      scope: 'identify email',
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
}

function googleLogin(req, res) {
  admin.auth().verifyIdToken(req.body.token)
    .then((decodedToken) => {
      const { uid } = decodedToken;

      db.get().collection('users').findOne({ uid }, (userErr, user) => {
        if (userErr) return res.status(404).send({ success: false, message: 'Unable to find user!' });

        if (!user) {
          const userDoc = {
            username: '',
            discriminator: '',
            display_name: '',
            email: req.body.email,
            avatar: null,
            uuid: uuidv4(),
            uid,
            twitter: '',
            instagram: '',
            switch_friend_code: '',
            discord_sync: false,
            hide_discord: true,
            google_sync: true,
          };

          db.get().collection('users').insertOne(userDoc, (newUserErr, newUser) => {
            if (newUserErr) return res.status(404).send({ success: false, message: 'Unable to create new user!' });

            const userJWT = {
              uuid: newUser.ops[0].uuid,
              username: newUser.ops[0].username,
              discriminator: newUser.ops[0].discriminator,
            };

            const token = jwt.sign(userJWT, process.env.JWT_SECRET,
              { expiresIn: 60 * 60 * process.env.JWT_HOURS });
            res.cookie('jwt', token);
            res.status(200).send({
              success: true,
              jwt: token,
            });
          });
        } else {
          const userJWT = {
            uuid: user.uuid,
            username: user.username,
            discriminator: user.discriminator,
          };

          const token = jwt.sign(userJWT, process.env.JWT_SECRET,
            { expiresIn: 60 * 60 * process.env.JWT_HOURS });
          res.cookie('jwt', token);
          res.status(200).send({
            success: true,
            jwt: token,
          });
        }
      });
    }).catch((error) => {
      console.log('Error: \n', error);
      res.status(400).send({
        success: false,
        message: 'Unable to validate user!',
      });
    });
}

function emailRegistration(req, res) {
  admin.auth().verifyIdToken(req.body.token)
    .then((decodedToken) => {
      const { uid } = decodedToken;

      const userDoc = {
        username: '',
        discriminator: '',
        display_name: '',
        email: req.body.email,
        avatar: null,
        uuid: uuidv4(),
        uid,
        twitter: '',
        instagram: '',
        switch_friend_code: '',
        discord_sync: false,
        hide_discord: true,
        email_user: true,
      };

      db.get().collection('users').insertOne(userDoc, (newUserErr, newUser) => {
        if (newUserErr) return res.status(404).send({ success: false, message: 'Unable to create new user!' });

        const userJWT = {
          uuid: newUser.ops[0].uuid,
          username: newUser.ops[0].username,
        };

        const token = jwt.sign(userJWT, process.env.JWT_SECRET,
          { expiresIn: 60 * 60 * process.env.JWT_HOURS });
        res.cookie('jwt', token);
        res.status(200).send({
          success: true,
          jwt: token,
        });
      });
    }).catch((error) => {
      console.log('Error: \n', error);
      res.status(400).send({
        success: false,
        message: 'Unable to validate user!',
      });
    });
}

function emailLogin(req, res) {
  admin.auth().verifyIdToken(req.body.token)
    .then((decodedToken) => {
      const { uid } = decodedToken;

      db.get().collection('users').findOne({ uid }, (userErr, user) => {
        if (userErr) return res.status(404).send({ success: false, message: 'Unable to find user!' });

        const userJWT = {
          uuid: user.uuid,
          username: user.username,
          discriminator: user.discriminator,
        };

        const token = jwt.sign(userJWT, process.env.JWT_SECRET,
          { expiresIn: 60 * 60 * process.env.JWT_HOURS });
        res.cookie('jwt', token);
        res.status(200).send({
          success: true,
          jwt: token,
        });
      });
    }).catch(() => {
      res.status(400).send({
        success: false,
        message: 'Unable to validate user!',
      });
    });
}

module.exports = {
  discordLogin,
  googleLogin,
  emailRegistration,
  emailLogin,
};
