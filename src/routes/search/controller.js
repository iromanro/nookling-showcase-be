/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');
const db = require('../../db.js');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '/Users/topnotch/Desktop/Streaminions/streaminions-app/server/.env' });
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
  findItem,
};
