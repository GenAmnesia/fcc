/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*
*/

const chaiHttp = require('chai-http');
const chai = require('chai');

const { assert } = chai;
const server = require('../server');
const Book = require('../models/Book');

chai.use(chaiHttp);

const seedBook = async (num) => {
  const promises = [];
  const data = [];
  for (let i = 1; i <= num; i += 1) {
    const book = new Book({ title: `Test#${i}` });
    const comments = ['1', '2', '3'].map((v) => `Comment #${v} for ${book.title}`);
    book.comments = comments;
    data.push(book);
    promises.push(book.save());
  }
  await Promise.all(promises);
  return data;
};

suite('Functional Tests', () => {
  // /*
  // * ----[EXAMPLE TEST]----
  // * Each test should completely test the response of the API end-point including response status code!
  // */
  // test('#example Test GET /api/books', (done) => {
  //   chai.request(server)
  //     .get('/api/books')
  //     .end((err, res) => {
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, 'response should be an array');
  //       assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
  //       assert.property(res.body[0], 'title', 'Books in array should contain title');
  //       assert.property(res.body[0], '_id', 'Books in array should contain _id');
  //       done();
  //     });
  // });
  // /*
  // * ----[END of EXAMPLE TEST]----
  // */

  suite('Routing tests', () => {
    suite('POST /api/books with title => create book object/expect book object', () => {
      test('Test POST /api/books with title', async () => {
        const res = await chai.request(server).post('/api/books').send({ title: 'test' });
        assert.equal(res.status, 200);
        assert.property(res.body, 'comments', 'Books in array should contain comments');
        assert.property(res.body, 'title', 'Books in array should contain title');
        assert.property(res.body, '_id', 'Books in array should contain _id');
        await Book.deleteOne({ _id: res._id });
      });

      test('Test POST /api/books with no title given', async () => {
        const res = await chai.request(server).post('/api/books').send({});
        assert.equal(res.status, 200);
        assert.equal(res.text, 'missing required field title');
      });
    });

    suite('GET /api/books => array of books', () => {
      let bookData;
      suiteSetup(async () => {
        bookData = await seedBook(4);
      });
      suiteTeardown(async () => {
        bookData.forEach(async (book) => {
          await Book.deleteOne({ _id: book._id });
        });
      });
      test('Test GET /api/books', async () => {
        const res = await chai.request(server).get('/api/books');
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        bookData.forEach(({ _id, title, comments }) => {
          const bodyBook = res.body.find((el) => el._id === String(_id));
          assert.equal(bodyBook.title, title);
          assert.equal(bodyBook.commentcount, comments.length);
        });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', () => {
      let bookData;
      suiteSetup(async () => {
        bookData = await seedBook(1);
      });
      suiteTeardown(async () => {
        bookData.forEach(async (book) => {
          await Book.deleteOne({ _id: book._id });
        });
      });
      test('Test GET /api/books/[id] with id not in db', async () => {
        const res = await chai.request(server).get('/api/books/wrongid123');
        assert.equal(res.status, 200);
        assert.equal(res.text, 'no book exists');
      });

      test('Test GET /api/books/[id] with valid id in db', async () => {
        const { _id, title, comments } = bookData[0];
        const res = await chai.request(server).get(`/api/books/${String(_id)}`);
        assert.equal(res.status, 200);
        assert.equal(res.body._id, String(_id));
        assert.equal(res.body.title, title);
        assert.deepEqual(res.body.comments, comments);
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', () => {
      let bookData;
      suiteSetup(async () => {
        bookData = await seedBook(1);
      });
      suiteTeardown(async () => {
        bookData.forEach(async (book) => {
          await Book.deleteOne({ _id: book._id });
        });
      });
      test('Test POST /api/books/[id] with comment', async () => {
        const { _id, title, comments } = bookData[0];
        const res = await chai.request(server).post(`/api/books/${_id}`).send({ comment: 'New test comment' });
        assert.equal(res.status, 200);
        assert.equal(res.body._id, String(_id));
        assert.equal(res.body.title, title);
        assert.deepEqual(res.body.comments, [...comments, 'New test comment']);
      });

      test('Test POST /api/books/[id] without comment field', async () => {
        const res = await chai.request(server).post(`/api/books/${bookData[0]._id}`).send({});
        assert.equal(res.status, 200);
        assert.equal(res.text, 'missing required field comment');
      });

      test('Test POST /api/books/[id] with comment, id not in db', async () => {
        const res = await chai.request(server).post('/api/books/test123').send({});
        assert.equal(res.status, 200);
        assert.equal(res.text, 'no book exists');
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', async () => {
      let bookData;
      suiteSetup(async () => {
        bookData = await seedBook(1);
      });
      suiteTeardown(async () => {
        bookData.forEach(async (book) => {
          await Book.deleteOne({ _id: book._id });
        });
      });
      test('Test DELETE /api/books/[id] with valid id in db', async () => {
        const res = await chai.request(server).delete(`/api/books/${String(bookData[0]._id)}`);
        assert.equal(res.status, 200);
        assert.equal(res.text, 'delete successful');
      });

      test('Test DELETE /api/books/[id] with  id not in db', async () => {
        const res = await chai.request(server).delete('/api/books/64622d80e9be87538aaa6ff4');
        assert.equal(res.status, 200);
        assert.equal(res.text, 'no book exists');
      });
    });
  });
});
