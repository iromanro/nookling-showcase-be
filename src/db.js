const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
});

itemSchema.index({ name: 1 });
itemSchema.set('autoIndex', false);

if (process.env.NODE_ENV === 'development') {
  const dotenv = require('dotenv');
  dotenv.config({ path: '/Users/topnotch/Documents/nooklingshowcase/nooklingshowcase server/.env.development' })
}

console.log(process.env.MONGODB_URI);
const db = mongoose.createConnection(process.env.MONGODB_URI, (err) => {
  if (err) throw err;

  console.log('Connected to db!');
});

exports.get = () => {
  return db;
};

exports.item = () => {
  const item = mongoose.model('item', itemSchema);
  console.log(item)
  return item;
};
