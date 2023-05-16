/* eslint no-underscore-dangle: off */
const Issue = require('../models/Issue');

module.exports = (app) => {
  app.route('/api/issues/:project')

    .get(async (req, res, next) => {
      const { project } = req.params;
      try {
        const query = Issue.find({ project });
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
        if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) throw new Error('required field(s) missing');
        const issue = new Issue({
          project,
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
        res.status(200).send({ error: error.message || 'could not post' });
        next(error);
      }
    })

    .put(async (req, res, next) => {
      try {
        if (!req.body._id) throw new Error('missing _id', { cause: 'no-id' });

        const issue = await Issue.findById(req.body._id);

        Object.keys(req.body);
        if (Object.keys(req.body).length === 1 && Object.prototype.hasOwnProperty.call(req.body, '_id')) {
          throw new Error('no update field(s) sent', { cause: 'no-fields' });
        }

        issue.updated_on = new Date();
        issue.issue_title = req.body.issue_title;
        issue.issue_text = req.body.issue_text;
        issue.created_by = req.body.created_by;
        issue.assigned_to = req.body.assigned_to;
        issue.status_text = req.body.status_text;
        issue.open = req.body.open;
        const data = await issue.save();
        res.send({ result: 'successfully updated', _id: data._id });
      } catch (error) {
        if (error.cause === 'no-id') {
          res.status(200).send({ error: error.message });
        } else if (error.cause === 'no-fields') {
          res.status(200).send({ error: error.message, _id: req.body._id });
        } else {
          res.status(200).send({ error: 'could not update', _id: req.body._id });
        }
        next(error);
      }
    })

    .delete(async (req, res, next) => {
      try {
        if (!req.body._id) throw new Error('missing _id', { cause: 'no-id' });
        await Issue.deleteOne({ _id: req.body._id }).orFail();
        res.send({ result: 'successfully deleted', _id: req.body._id });
      } catch (error) {
        if (error.cause === 'no-id') res.status(200).send({ error: error.message });
        else res.status(200).send({ error: 'could not delete', _id: req.body._id });
        next(error);
      }
    });
};
