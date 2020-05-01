// const express = require('express');
// const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
// const qs = require('query-string');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');
// const {ObjectId} = require('mongoose').Types;
const db = require('../../db.js');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '/Users/topnotch/Desktop/Streaminions/streaminions-app/server/.env' });
}

function createPost(req, res) {
  db.get().collection('users').findOne({ uuid: req.decoded.uuid }, (userErr, user) => {
    if (userErr) return res.status(404).send({ success: false, message: 'User not found!' });

    const post = {
      id: req.body.postId,
      creator: user.uuid,
      design_name: req.body.name,
      description: req.body.description,
      design_type: req.body.type,
      design_tags: req.body.tags,
      images: req.body.images,
      allow_contributions: req.body.allowContributions,
      furniture: [],
    };

    db.get().collection('creations').insertOne(post, (postErr, newPost) => {
      if (postErr) return res.status(404).send({ success: false, message: 'Unable to create new post!' });

      res.status(200).send({
        success: true,
        postId: newPost.ops[0].id,
      });
    });
  });
}

module.exports = {
  createPost,
};
