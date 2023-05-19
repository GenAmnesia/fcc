const chai = require('chai');
const chaiHttp = require('chai-http');
const examples = require('../controllers/puzzle-strings');

const { assert } = chai;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  suite('/api/solve POST', () => {
    test('Solve a puzzle with valid puzzle string', (done) => {
      chai.request(server).post('/api/solve').send({ puzzle: examples[5][0] }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'solution');
        assert.equal(res.body.solution, examples[5][1]);
      });
      chai.request(server).post('/api/solve').send({ puzzle: examples[4][0] }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'solution');
        assert.equal(res.body.solution, examples[4][1]);
        done();
      });
    });
    test('Solve a puzzle with missing puzzle string', (done) => {
      chai.request(server).post('/api/solve').send({ puzzle: '' }).end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Required field missing');
        done();
      });
    });
    test('Solve a puzzle with invalid characters', (done) => {
      chai.request(server).post('/api/solve').send({ puzzle: '123...aa...bcd....0.....12...34...56.............43....123..........4332.....1234' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Invalid characters in puzzle');
          done();
        });
    });
    test('Solve a puzzle with invalid length', (done) => {
      chai.request(server).post('/api/solve').send({ puzzle: '....2' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
        });
      chai.request(server).post('/api/solve').send({ puzzle: '123...aa...bcd....0.....12...34...56.............43....123..........4332.....1234....2' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
          done();
        });
    });
    test('Fail to solve a puzzle with no solution', (done) => {
      chai.request(server).post('/api/solve').send({ puzzle: '123...22...345....8.....12...34...56.............43....123..........4332.....1234' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Puzzle cannot be solved');
        });
      chai.request(server).post('/api/solve').send({ puzzle: '1.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Puzzle cannot be solved');
          done();
        });
    });
  });
  suite('/api/check POST', () => {
    test('Puzzle placement with all fields', (done) => {
      chai.request(server).post('/api/check').send({ puzzle: examples[5][0], coordinate: 'A1', value: '7' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'valid');
          assert.isTrue(res.body.valid);
          done();
        });
    });
    test('Puzzle placement with single conflict', (done) => {
      chai.request(server).post('/api/check').send({ puzzle: examples[5][0], coordinate: 'A1', value: '2' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'valid');
          assert.isNotTrue(res.body.valid);
          assert.property(res.body, 'conflict');
          assert.isArray(res.body.conflict);
          assert.lengthOf(res.body.conflict, 1);
          assert.equal(res.body.conflict[0], 'region');
          done();
        });
    });
    test('Puzzle placement with multiple conflict', (done) => {
      chai.request(server).post('/api/check').send({ puzzle: examples[5][0], coordinate: 'A1', value: '4' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'valid');
          assert.isNotTrue(res.body.valid);
          assert.property(res.body, 'conflict');
          assert.isArray(res.body.conflict);
          assert.lengthOf(res.body.conflict, 2);
          assert.include(res.body.conflict, 'column');
          assert.include(res.body.conflict, 'region');
          done();
        });
    });
    test('Puzzle placement with every conflict', (done) => {
      chai.request(server).post('/api/check').send({ puzzle: examples[5][0], coordinate: 'A1', value: '5' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'valid');
          assert.isNotTrue(res.body.valid);
          assert.property(res.body, 'conflict');
          assert.isArray(res.body.conflict);
          assert.lengthOf(res.body.conflict, 3);
          assert.include(res.body.conflict, 'column');
          assert.include(res.body.conflict, 'region');
          assert.include(res.body.conflict, 'row');
          done();
        });
    });
    test('Puzzle placement with missing fields', (done) => {
      chai.request(server).post('/api/check').send({ puzzle: '', coordinate: 'A1', value: '2' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Required field(s) missing');
          done();
        });
    });
    test('Puzzle placement with invalid characters on puzzle', (done) => {
      chai.request(server).post('/api/check').send({ puzzle: '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..a..', coordinate: 'A1', value: '2' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Invalid characters in puzzle');
          done();
        });
    });
    test('Puzzle placement with incorrect puzzle length', (done) => {
      chai.request(server).post('/api/check').send({ puzzle: '...123', coordinate: 'A1', value: '2' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
          done();
        });
    });
    test('Puzzle placement with invalid coordinates', (done) => {
      chai.request(server).post('/api/check').send({ puzzle: examples[5][0], coordinate: 't9', value: '2' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Invalid coordinate');
          done();
        });
    });
    test('Puzzle placement with invalid value', (done) => {
      chai.request(server).post('/api/check').send({ puzzle: examples[5][0], coordinate: 'a9', value: '21' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Invalid value');
          done();
        });
    });
  });
});
