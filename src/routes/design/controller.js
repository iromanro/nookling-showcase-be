/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');
const db = require('../../db.js');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '/Users/topnotch/Desktop/Streaminions/streaminions-app/server/.env' });
}

function createDesign(req, res) {
  db.get().collection('users').findOne({ uuid: req.decoded.uuid }, (userErr, user) => {
    if (userErr) return res.status(404).send({ success: false, message: 'User not found!' });

    const post = {
      uuid: req.body.postId,
      creator: user.uuid,
      design_name: req.body.name,
      description: req.body.description,
      design_type: req.body.type,
      design_tags: req.body.tags,
      images: req.body.images,
      allow_contributions: req.body.allowContributions,
      furniture: [],
      likes: 0,
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

function getDesign(req, res) {
  const authorizationHeader = req.headers.authorization;
  let userUuid = '';

  if (authorizationHeader) {
    const token = authorizationHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      userUuid = decoded.uuid;
    });
  }

  let uuid = '';
  if (req.params.uuid) {
    uuid = req.params.uuid;
  }

  db.get().collection('creations').aggregate([
    { $match: { uuid } },
    {
      $lookup: {
        from: 'users',
        localField: 'creator',
        foreignField: 'uuid',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $lookup: {
        from: 'likes',
        localField: 'uuid',
        foreignField: 'designId',
        as: 'userLikes',
      },
    },
    {
      $lookup: {
        from: 'items',
        localField: 'furniture',
        foreignField: 'uuid',
        as: 'designFurniture',
      },
    },
    {
      $project: {
        _id: 0,
        uuid: 1,
        design_name: 1,
        design_type: 1,
        design_tags: 1,
        description: 1,
        images: 1,
        allow_contributions: 1,
        user: {
          // _id: 0,
          display_name: 1,
          avatar: 1,
          uuid: 1,
        },
        designFurniture: {
          uuid: 1,
          name: 1,
          image: 1,
        },
        userLikes: 1,
      },
    },
  ]).toArray((resultsErr, results) => {
    if (resultsErr) return res.status(404).send({ success: false, message: 'User not found!' });

    db.get().collection('likes').findOne({ userId: userUuid, designId: results[0].uuid }, (likeErr, like) => {
      let userLiked = false;

      if (like) {
        userLiked = true;
      }

      const designInfo = {
        uuid: results[0].uuid,
        name: results[0].design_name,
        type: results[0].design_type,
        tags: results[0].design_tags,
        description: results[0].description,
        images: results[0].images,
        allowContributions: results[0].allow_contributions,
        user: results[0].user,
      };

      res.status(200).send({
        success: true,
        design: designInfo,
        userLiked,
        likes: results[0].userLikes.length,
        furniture: results[0].designFurniture,
      });
    });
  });
}

function likeDesign(req, res) {
  let uuid = '';
  if (req.params.uuid) {
    uuid = req.params.uuid;
  }

  db.get().collection('users').findOne({ uuid: req.decoded.uuid }, (userErr, user) => {
    if (userErr) return res.status(404).send({ success: false, message: 'User not found!' });

    db.get().collection('creations').findOne({ uuid }, (creationErr, creation) => {
      if (creationErr) return res.status(404).send({ success: false, message: 'Design not found!' });

      db.get().collection('likes').find({ designId: creation.uuid }).toArray((designLikesErr, designLikes) => {
        if (designLikesErr) return res.status(404).send({ success: false, message: 'Unable to get likes!' });

        db.get().collection('likes').findOne({ userId: req.decoded.uuid, designId: creation.uuid }, (userLikeErr, userLike) => {
          if (userLikeErr) return res.status(404).send({ success: false, message: 'Unable to like design!' });

          if (!userLike) {
            const newLike = {
              userId: user.uuid,
              designId: creation.uuid,
            };

            db.get().collection('likes').insertOne(newLike, () => {
              res.status(200).send({
                success: true,
                liked: true,
                likes: designLikes.length + 1,
              });
            });
          } else {
            db.get().collection('likes').deleteOne({ userId: req.decoded.uuid, designId: creation.uuid }, () => {
              res.status(200).send({
                success: true,
                liked: false,
                likes: designLikes.length - 1,
              });
            });
          }
        });
      });
    });
  });
}

function addItem(req, res) {
  db.get().collection('creations').findOne({ uuid: req.params.uuid }, (creationErr, creation) => {
    if (creationErr) return res.status(404).send({ success: false, message: 'Could not find that design!' });

    let canAdd = false;
    if (creation.allow_contributions) {
      canAdd = true;
    } else if (!creation.allow_contributions && creation.creator === req.decoded.uuid) {
      canAdd = true;
    }

    if (canAdd) {
      const newFurniture = [...creation.furniture];
      if (!newFurniture.includes(req.body.itemId)) {
        newFurniture.push(req.body.itemId);

        db.get().collection('creations').findOneAndUpdate({ uuid: req.params.uuid },
          {
            $set: {
              furniture: newFurniture,
            },
          },
          { returnOriginal: false },
          (updatedCreationErr, updatedCreation) => {
            if (updatedCreationErr) return res.status(404).send({ success: false, message: 'Could not add item to design!' });

            db.get().collection('creations').aggregate([
              { $match: { uuid: updatedCreation.value.uuid } },
              {
                $lookup: {
                  from: 'items',
                  localField: 'furniture',
                  foreignField: 'uuid',
                  as: 'designFurniture',
                },
              },
              { $unwind: '$designFurniture' },
              {
                $project: {
                  _id: 0,
                  designFurniture: {
                    uuid: 1,
                    name: 1,
                    image: 1,
                  },
                },
              },
            ]).toArray((furnitureListErr, furnitureList) => {
              const list = [];

              furnitureList.forEach((item) => {
                list.push(item.designFurniture);
              });

              return res.status(200).send({
                success: true,
                furniture: list,
              });
            });
          });
      } else {
        return res.status(400).send({
          success: false,
          message: 'Item already exists!',
        });
      }
    } else {
      return res.status(405).send({
        success: false,
        error: 'Permission denied!',
      });
    }
  });
}

function removeItem(req, res) {
  db.get().collection('creations').findOne({ uuid: req.params.uuid }, (creationErr, creation) => {
    if (creationErr) return res.status(404).send({ success: false, message: 'Could not find that design!' });

    let canRemove = false;
    if (creation.creator === req.decoded.uuid) {
      canRemove = true;
    }

    if (canRemove) {
      let newFurniture = [...creation.furniture];
      if (newFurniture.includes(req.body.itemId)) {
        const itemIndex = newFurniture.indexOf(req.body.itemId);
        console.log("BEfore: ", newFurniture.length)
        newFurniture.splice(itemIndex, 1);
        console.log("After: ", newFurniture.length)
        //newFurniture.remove(req.body.itemId);

        db.get().collection('creations').findOneAndUpdate({ uuid: req.params.uuid },
          {
            $set: {
              furniture: newFurniture,
            },
          },
          { returnOriginal: false },
          (updatedCreationErr, updatedCreation) => {
            if (updatedCreationErr) return res.status(404).send({ success: false, message: 'Could not add item to design!' });

            db.get().collection('creations').aggregate([
              { $match: { uuid: updatedCreation.value.uuid } },
              {
                $lookup: {
                  from: 'items',
                  localField: 'furniture',
                  foreignField: 'uuid',
                  as: 'designFurniture',
                },
              },
              { $unwind: '$designFurniture' },
              {
                $project: {
                  _id: 0,
                  designFurniture: {
                    uuid: 1,
                    name: 1,
                    image: 1,
                  },
                },
              },
            ]).toArray((furnitureList) => {
              const list = [];

              if (furnitureList) {
                furnitureList.forEach((item) => {
                  list.push(item.designFurniture);
                });
              }

              return res.status(200).send({
                success: true,
                furniture: list,
              });
            });
          });
      } else {
        return res.status(400).send({
          success: false,
          message: 'Item does not exists!',
        });
      }
    } else {
      return res.status(405).send({
        success: false,
        error: 'Permission denied!',
      });
    }
  });
}

module.exports = {
  createDesign,
  getDesign,
  likeDesign,
  addItem,
  removeItem,
};
