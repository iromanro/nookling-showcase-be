/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');
const db = require('../../db.js');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '/Users/topnotch/Desktop/Streaminions/streaminions-app/server/.env' });
}

function findDesigns(req, res) {
  console.log("req: ", req.query)
  let query = {
    sort: 'featured',
    type: 'any',
    name: '',
  };

  if (Object.keys(req.query).length > 0) {
    console.log("WE HAVE A QUERY")
  }

  db.get().collection('creations').aggregate([
    { $match: { featured: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'creator',
        foreignField: 'uuid',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $set: {
        'display_name': '$user.display_name',
      },
    },
    {
      $project: {
        _id: 0,
        creator: 1,
        design_name: 1,
        images: 1,
        likes: 1,
        uuid: 1,
        display_name: 1,
        user: {
          display_name: 1,
        },
      },
    }
  ]).toArray((resultsErr, results) => {
    console.log("Error: ", resultsErr)
    console.log("Results: ", results)

    return res.status(200).send({
      success: true,
      creations: results,
    });
  });
}

function findItem(req, res) {
  console.log(req.params.term);
  let expr = `${req.params.term}`;
  expr = expr.replace(' ', '.*');
  console.log(expr);

  db.get().collection('items').aggregate([
    { $match: { name: { $regex: expr, $options: 'i' } } },
    { $limit: 20 },
    {
      $project: {
        _id: 0,
        uuid: 1,
        name: 1,
        image: 1,
      },
    },
  ]).toArray((resultsErr, results) => {
    if (resultsErr) return res.status(400).send({ success: false, message: 'Could not find item!' });

    console.log("Results: ", results.length);

    res.status(200).send({
      success: true,
      results,
    });
  });
}

module.exports = {
  findDesigns,
  findItem,
};
