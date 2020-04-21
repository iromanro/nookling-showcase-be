const mongoose = require('mongoose');

if (process.env.NODE_ENV === 'development') {
  const dotenv = require('dotenv');
  dotenv.config({ path: '/Users/topnotch/Documents/nooklingshowcase/nooklingshowcase server/.env.development' })
}

console.log(process.env.MONGODB_URI);
const db = mongoose.createConnection(process.env.MONGODB_URI, (err) => {
  if (err) throw err;

  console.log('Connected to db!')
});

exports.get = () => { 
  return db;
};
