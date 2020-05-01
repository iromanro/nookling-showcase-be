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

function getUserSettings(req, res) {
  console.log(req.decoded.uuid);

  db.get().collection('users').findOne({ uuid: req.decoded.uuid }, (userErr, user) => {
    if (userErr) return res.status(404).send({ success: false, message: "Unable to find user!"})

    let settings = {
      username: user.username,
      discriminator: user.discriminator,
      hideDiscord: user.hide_discord,
      avatar: user.avatar,
      displayName: user.display_name,
      twitter: user.twitter,
      instagram: user.instagram,
      twitch: user.twitch,
      switchFriendCode: user.switch_friend_code,
      discordSync: user.discord_sync,
    }

    res.status(200).send({
      success: true,
      settings,
    })
  })
}

function updateUserSettings(req, res) {
  db.get().collection('users').findOne({ uuid: req.decoded.uuid }, (userErr, user) => {
    if (userErr) return res.status(404).send({ success: false, message: "Unable to find user!"})

    console.log(req.body.settings)

    db.get().collection('users').findOneAndUpdate({ uuid: req.decoded.uuid },
      {
        $set: {
          display_name: req.body.settings.displayName,
          hide_discord: req.body.settings.hideDiscord,
          twitter: req.body.settings.twitter,
          instagram: req.body.settings.instagram,
          twitch: req.body.settings.twitch,
          switch_friend_code: req.body.settings.switchFriendCode,
        },
      },
      { returnOriginal: false },
      (updatedSettingsErr, updatedSettings) => {
        if (updatedSettingsErr) return res.status(404).send({ success: false, message: "Error updating settings!"})

        let settings = {
          username: updatedSettings.value.username,
          discriminator: updatedSettings.value.discriminator,
          hideDiscord: updatedSettings.value.hide_discord,
          avatar: updatedSettings.value.avatar,
          displayName: updatedSettings.value.display_name,
          twitter: updatedSettings.value.twitter,
          instagram: updatedSettings.value.instagram,
          twitch: updatedSettings.value.twitch,
          switchFriendCode: updatedSettings.value.switch_friend_code,
          discordSync: updatedSettings.value.discord_sync,
        }

        res.status(200).send({
          success: true,
          settings,
        })
      })
  })
}

module.exports = {
  getUserSettings,
  updateUserSettings
};
