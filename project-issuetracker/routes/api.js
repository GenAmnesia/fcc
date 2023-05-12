/* eslint no-underscore-dangle: off */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProjectSchema = new Schema({
  name: { type: String, required: true, unique: true },
});
const Project = mongoose.model('Project', ProjectSchema);

const IssueSchema = new Schema({
  project: { type: Schema.ObjectId, ref: 'Project', required: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
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
const Issue = mongoose.model('Issue', IssueSchema);

module.exports = (app) => {
  app.route('/api/issues/:project')

    .get(async (req, res, next) => {
      const { project } = req.params;
      try {
        const projectData = await Project.findOne({ name: project }).orFail(() => Error(`Project ${project} not found!`));
        const query = Issue.find({ project: projectData._id });
        if (req.query.open) query.find({ open: req.query.open });
        if (req.query.created_by) query.find({ created_by: req.query.created_by });
        if (req.query.assigned_to) query.find({ assigned_to: req.query.assigned_to });

        const data = await query.select({ __v: 0, project: 0 }).exec();
        res.send(data);
      } catch (error) { next(error); }
    })

    .post(async (req, res, next) => {
      const { project } = req.params;
      try {
        const projectData = await Project.findOne({ name: project }).orFail(() => Error(`Project ${project} not found!`));
        const issue = new Issue({
          project: projectData._id,
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_on: new Date(),
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to,
          status_text: req.body.status_text,
        });
        const issueData = await issue.save();
        res.send(issueData.getPublicFields());
      } catch (error) {
        next(error);
      }
    })

    .put(async (req, res, next) => {
      try {
        const issue = await Issue.findOne({ _id: req.body._id }).orFail(() => Error(`No issue ${req.body._id} found!`));
        issue.updated_on = new Date();
        if (req.body.issue_title) issue.issue_title = req.body.issue_title;
        if (req.body.issue_text) issue.issue_text = req.body.issue_text;
        if (req.body.created_by) issue.created_by = req.body.created_by;
        if (req.body.assigned_to) issue.assigned_to = req.body.assigned_to;
        if (req.body.status_text) issue.status_text = req.body.status_text;
        if (req.body.open) issue.open = req.body.open;
        const data = await issue.save();
        res.send(data.getPublicFields());
      } catch (error) { next(error); }
    })

    .delete((req, res, next) => {
      Issue.deleteOne({ _id: req.body._id })
        .then((data) => res.send(data))
        .catch((err) => next(err));
    });
};
