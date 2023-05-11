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

    .get((req, res) => {
      const { project } = req.params;
    })

    .post((req, res) => {
      const { project } = req.params;

      Project.findOne({ name: project })
        .orFail(() => Error(`Project ${project} not found!`))
        .then((projectData) => {
          const issue = new Issue({
            project: projectData._id, // eslint-disable-line no-underscore-dangle
            issue_title: req.body.issue_title,
            issue_text: req.body.issue_text,
            created_on: new Date(),
            created_by: req.body.created_by,
            assigned_to: req.body.assigned_to,
            status_text: req.body.status_text,
          });
          issue.save()
            .then((issueData) => {
              res.send(issueData.getPublicFields());
            })
            .catch((issueErr) => res.send(issueErr.message ? issueErr.message : 'Error creating an issue.'));
        })
        .catch((projecterr) => res.send(projecterr.message ? projecterr.message : 'Error finding the project.'));
    })

    .put((req, res) => {
      const { project } = req.params;
    })

    .delete((req, res) => {
      const { project } = req.params;
    });
};
