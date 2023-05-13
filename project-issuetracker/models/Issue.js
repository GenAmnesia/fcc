/* eslint no-underscore-dangle: off */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const IssueSchema = new Schema({
  project: { type: String },
  issue_title: { type: String },
  issue_text: { type: String },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  created_by: { type: String, default: '' },
  assigned_to: { type: String, default: '' },
  open: { type: Boolean, default: true },
  status_text: { type: String, default: '' },
});
IssueSchema.methods.getPublicFields = function () {
  const returnObject = { ...this._doc };
  delete returnObject.project;
  delete returnObject.__v;
  return returnObject;
};

module.exports = mongoose.model('Issue', IssueSchema);
