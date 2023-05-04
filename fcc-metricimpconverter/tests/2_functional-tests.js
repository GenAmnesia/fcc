const chaiHttp = require('chai-http');
const chai = require('chai');

const { assert } = chai;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
    test('4gal GET', (done) => {
        chai
            .request(server)
            .get('/api/convert?input=4gal')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.initNum, '4');
                assert.equal(res.body.initUnit, 'gal');
                assert.equal(res.body.returnNum, '15.142');
                assert.equal(res.body.returnUnit, 'L');
                assert.equal(res.body.string, '4 gallons converts to 15.142 liters');
                done();
            });
    });
    test('32g GET', (done) => {
        chai
            .request(server)
            .get('/api/convert?input=32g')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'invalid unit');
                done();
            });
    });
    test('3/7.2/4kg GET', (done) => {
        chai
            .request(server)
            .get('/api/convert?input=3/7.2/4kg')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'invalid number');
                done();
            });
    });
    test('3/7.2/4kilomegagram GET', (done) => {
        chai
            .request(server)
            .get('/api/convert?input=3/7.2/4kilomegagram')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'invalid number and unit');
                done();
            });
    });
    test('kg GET', (done) => {
        chai
            .request(server)
            .get('/api/convert?input=kg')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.type, 'application/json');
                assert.equal(res.body.initNum, '1');
                assert.equal(res.body.initUnit, 'kg');
                assert.equal(res.body.returnNum, '2.205');
                assert.equal(res.body.returnUnit, 'lbs');
                assert.equal(res.body.string, '1 kilograms converts to 2.205 pounds');
                done();
            });
    });
});
