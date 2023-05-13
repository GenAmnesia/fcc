/* eslint no-underscore-dangle: off */
const chaiHttp = require('chai-http');
const chai = require('chai');

const { assert } = chai;
const server = require('../server');
const Project = require('../models/Project');
const Issue = require('../models/Issue');

chai.use(chaiHttp);

const seedIssues = async (num, project) => {
  const promises = [];
  const data = [];
  for (let i = 1; i <= num; i += 1) {
    const issueData = {
      project,
      issue_title: `Test-Seed#${i}`,
      issue_text: `Test#${i}`,
      created_by: 'MochaChai',
      assigned_to: i % 2 === 0 ? 'You' : 'Me',
      open: i % 2 === 0,
    };
    const issue = new Issue(issueData);
    data.push(issue);
    promises.push(issue.save());
  }
  await Promise.all(promises);
  return data;
};

suite('Functional Tests', () => {
  const projectName = 'chai-test-project';
  suiteSetup(async () => {
    await Issue.deleteMany({ created_by: 'MochaChai' });
  });

  suiteTeardown(async () => {
    await Issue.deleteMany({ project: projectName });
    await Project.deleteMany({ name: projectName });
  });

  suite('POST /api/issues/{project}', () => {
    suiteTeardown(async () => {
      await Issue.deleteMany({ project: projectName });
    });
    test('Create an issue with every field', async () => {
      const issueData = {
        issue_title: 'Test#1',
        issue_text: 'Create an issue with every field',
        created_by: 'MochaChai',
        assigned_to: 'Nodejs',
        status_text: 'Opened functionally',
      };
      const res = await chai
        .request(server)
        .post(`/api/issues/${projectName}`)
        .send(issueData);
      assert.equal(res.status, 200);
      assert.equal(res.type, 'application/json');
      assert.property(res.body, '_id');
      assert.equal(res.body.issue_title, issueData.issue_title);
      assert.equal(res.body.issue_text, issueData.issue_text);
      assert.equal(res.body.created_by, issueData.created_by);
      assert.equal(res.body.assigned_to, issueData.assigned_to);
      assert.equal(res.body.status_text, issueData.status_text);
      assert.equal(res.body.open, true);
      const issue = await Issue.findById(res.body._id);
      assert.ok(issue);
      assert.equal(issue.issue_title, issueData.issue_title);
      assert.equal(issue.issue_text, issueData.issue_text);
      assert.equal(issue.created_by, issueData.created_by);
      assert.equal(issue.assigned_to, issueData.assigned_to);
      assert.equal(issue.status_text, issueData.status_text);
      assert.equal(issue.open, true);
    });
    test('Create an issue with only required fields', async () => {
      const issueData = {
        issue_title: 'Test#2',
        issue_text: 'Create an issue with only required field',
        created_by: 'MochaChai',
      };
      const res = await chai
        .request(server)
        .post(`/api/issues/${projectName}`)
        .send(issueData);
      assert.equal(res.status, 200);
      assert.equal(res.type, 'application/json');
      assert.property(res.body, '_id');
      assert.equal(res.body.issue_title, issueData.issue_title);
      assert.equal(res.body.issue_text, issueData.issue_text);
      assert.equal(res.body.created_by, issueData.created_by);
      assert.equal(res.body.assigned_to, '');
      assert.equal(res.body.status_text, '');
      assert.equal(res.body.open, true);
      const issue = await Issue.findById(res.body._id);
      assert.ok(issue);
      assert.equal(issue.issue_title, issueData.issue_title);
      assert.equal(issue.issue_text, issueData.issue_text);
      assert.equal(issue.created_by, issueData.created_by);
      assert.equal(issue.assigned_to, '');
      assert.equal(issue.status_text, '');
      assert.equal(issue.open, true);
    });
    test('Create an issue with missing required fields', (done) => {
      chai
        .request(server)
        .post('/api/issues/apitest')
        .send({})
        .end((err, res) => {
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });

  suite('GET /api/issues/{project}', () => {
    let issuesData;
    suiteSetup(async () => {
      issuesData = await seedIssues(4, projectName);
    });
    suiteTeardown(async () => {
      await Issue.deleteMany({ project: projectName });
    });

    test('View issues on a project', async () => {
      const res = await chai.request(server).get(`/api/issues/${projectName}`);
      assert.equal(res.status, 200);
      assert.isArray(res.body);
      assert.lengthOf(res.body, issuesData.length);
      issuesData.forEach(({
        issue_title, issue_text, created_by, _id, open,
      }) => {
        const bodyIssue = res.body.find((el) => el._id === _id.toString());
        assert.isOk(bodyIssue);
        assert.equal(bodyIssue.issue_title, issue_title);
        assert.equal(bodyIssue.issue_text, issue_text);
        assert.equal(bodyIssue.created_by, created_by);
        assert.equal(bodyIssue.open, open);
      });
    });
    test('View issues on a project with one filter', async () => {
      const res = await chai.request(server)
        .get(`/api/issues/${projectName}`)
        .query({ assigned_to: 'Me' });
      assert.equal(res.status, 200);
      assert.equal(res.type, 'application/json');
      assert.isArray(res.body);
      assert.lengthOf(res.body, 2);
      res.body.forEach((testingEl) => {
        assert.equal(testingEl.assigned_to, 'Me');
      });
    });
    test('View issues on a project with multiple filters', async () => {
      const res = await chai.request(server).get(`/api/issues/${projectName}`)
        .query({ assigned_to: 'You', open: true });
      assert.equal(res.status, 200);
      assert.equal(res.type, 'application/json');
      assert.isArray(res.body);
      assert.lengthOf(res.body, 2);
      res.body.forEach((testingEl) => {
        assert.equal(testingEl.assigned_to, 'You');
        assert.isTrue(testingEl.open);
      });
    });
  });

  suite('PUT /api/issues/{project}', () => {
    let issueId;
    suiteSetup(async () => {
      const issue = new Issue({
        issue_title: 'PutTest',
        created_by: 'MochaChai',
        issue_text: 'A test...',
        assigned_to: 'No one',
        project: projectName,
      });
      await issue.save();
      issueId = String(issue._id);
    });
    suiteTeardown(async () => {
      await Issue.deleteMany({ project: projectName });
    });

    test('Update one field on an issue', async () => {
      const res = await chai.request(server)
        .put(`/api/issues/${projectName}`)
        .send({ _id: issueId, issue_text: 'A test edited' });
      assert.equal(res.body.result, 'successfully updated');
      assert.equal(res.body._id, issueId);
      const editedIssue = await Issue.findById(issueId);
      assert.equal(editedIssue.issue_text, 'A test edited');
    });

    test('Update multiple fields on an issue', async () => {
      const query = {
        _id: issueId,
        issue_title: 'PutTest2',
        issue_text: 'A test edited again',
        assigned_to: 'Me',
        open: false,
      };
      const res = await chai.request(server)
        .put(`/api/issues/${projectName}`)
        .send(query);
      assert.equal(res.body.result, 'successfully updated');
      assert.equal(res.body._id, issueId);
      const editedIssue = await Issue.findById(issueId);
      assert.equal(editedIssue.issue_text, query.issue_text);
      assert.equal(editedIssue.issue_title, query.issue_title);
      assert.equal(editedIssue.assigned_to, query.assigned_to);
      assert.equal(editedIssue.open, query.open);
    });

    test('Update an issue with missing _id', async () => {
      const res = await chai.request(server).put(`/api/issues/${projectName}`).send({});
      assert.equal(res.body.error, 'missing _id');
    });

    test('Update ad issue with no fields to update', async () => {
      const res = await chai.request(server).put(`/api/issues/${projectName}`).send({ _id: issueId });
      assert.equal(res.body.error, 'no update field(s) sent');
    });

    test('Update ad issue with an invalid id', async () => {
      const res = await chai.request(server).put(`/api/issues/${projectName}`).send({ _id: 'test123', issue_title: 'testing' });
      assert.equal(res.body.error, 'could not update');
      assert.equal(res.body._id, 'test123');
    });
  });

  suite('DELETE /api/issues/{project}', () => {
    test('Delete an issue', async () => {
      const issue = new Issue({
        issue_title: 'DeleteTest',
        created_by: 'MochaChai',
        issue_text: 'A test...',
        project: projectName,
      });
      await issue.save();
      const res = await chai.request(server).delete(`/api/issues/${projectName}`).send({ _id: issue._id });
      assert.equal(res.status, 200);
      assert.equal(res.body.result, 'successfully deleted');
      assert.equal(res.body._id, issue._id);
    });

    test('Delete an issue with an invalid _id', async () => {
      const res = await chai.request(server).delete(`/api/issues/${projectName}`).send({ _id: 'test123' });
      assert.equal(res.body.error, 'could not delete');
      assert.equal(res.body._id, 'test123');
    });

    test('Delete an issue with missing _id', async () => {
      const res = await chai.request(server).delete(`/api/issues/${projectName}`).send({});
      assert.equal(res.body.error, 'missing _id');
    });
  });
});
