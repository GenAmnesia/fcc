const mongoose = require('mongoose');

const { Schema } = mongoose;

const BookSchema = new Schema({
  title: { type: String },
  comments: { type: [String], default: [] },
});

module.exports = mongoose.model('Book', BookSchema);
