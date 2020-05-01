/* eslint-disable no-label-var */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-labels */
/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
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

function getUserProfile(req, res) {
  let uuid = '';
  if (req.params.uuid) {
    uuid = req.params.uuid;
  } else {
    uuid = req.decoded.uuid;
  }

  db.get().collection('users').findOne({ uuid }, (userErr, user) => {
    if (userErr) return res.status(404).send({ success: false, message: 'User not found!' });

    db.get().collection('users').aggregate([
      { $match: { uuid } },
      {
        $lookup: {
          from: 'creations',
          localField: 'uuid',
          foreignField: 'creator',
          as: 'userCreations',
        },
      },
      {
        $unwind: '$userCreations',
      },
      {
        $set: {
          'userCreations.display_name': '$display_name',
          'userCreations.created': { $toDate: '$userCreations._id' },
        },
      },
      {
        $project: {
          uuid: 1,
          display_name: 1,
          userCreations: 1,
        },
      },
      { $skip: 0 },
      { $limit: 10 },
      {
        $sort: { userCreations: -1 },
      },
      {
        $group: {
          _id: '$uuid',
          creations: {
            $push: '$userCreations',
          },
        },
      },
      {
        $project: {
          uuid: 1,
          username: 1,
          discriminator: 1,
          email: 1,
          avatar: 1,
          display_name: 1,
          twitter: 1,
          instagram: 1,
          twitch: 1,
          switch_friend_code: 1,
          hide_discord: 1,
          // userPatterns: 1,
          // userIslands: 1,
          creations: 1,
        },
      },
    ]).toArray((contentErr, content) => {
      let creations = [];
      if (!content[0]) {
        creations: [];
      } else {
        content[0].creations.forEach((creation) => {
          creation.images = creation.images.slice(0, 2);
        });
        creations = content[0].creations;
      }

      const profileInfo = {
        displayName: user.display_name,
        avatar: user.avatar,
        twitter: user.twitter,
        instagram: user.instagram,
        twitch: user.twitch,
        friendCode: user.switch_friend_code,
      };

      if (!user.hide_discord) {
        profileInfo.username = user.username;
        profileInfo.discriminator = user.discriminator;
      }

      res.status(200).send({
        success: true,
        profile: profileInfo,
        creations,
      });
    });
  });
}

module.exports = {
  getUserProfile,
};
