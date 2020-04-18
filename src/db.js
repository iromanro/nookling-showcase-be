const mongoose = require('mongoose');

if (process.env.NODE_ENV === 'development') {
  const dotenv = require('dotenv');
  dotenv.config({ path: '/Users/topnotch/Desktop/Streaminions/streaminions-app/server/.env' });
}

const db = mongoose.createConnection(process.env.MONGODB_URI, (err) => {
  if (err) throw err;

  console.log('Connected to db!');
});

exports.get = () => { 
  return db;
};
