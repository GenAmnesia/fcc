const mongoose = require('mongoose');
const Book = require('../models/Book');

module.exports = (app) => {
  app.route('/api/books')
    .get(async (req, res, next) => {
      // response will be array of book objects
      // json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        const data = await Book.find({});
        res.send(
          data.map(({ _id, title, comments }) => (
            { _id, title, commentcount: comments.length }
          )),
        );
      } catch (error) {
        next(error);
      }
    })

    .post(async (req, res, next) => {
      try {
        const { title } = req.body;
        // response will contain new book object including atleast _id and title
        if (!title) throw new Error('missing required field title');
        const book = new Book({ title });
        const data = await book.save();
        res.send({ _id: data._id, title: data.title, comments: data.comments });
      } catch (error) {
        if (error.message) {
          res.send(error.message);
        }
        next(error);
      }
    })

    .delete(async (req, res, next) => {
      // if successful response will be 'complete delete successful'
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (error) {
        next(error);
      }
    });

  app.route('/api/books/:id')
    .get(async (req, res, next) => {
      try {
        const bookid = req.params.id;
        // json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
        if (!mongoose.Types.ObjectId.isValid(bookid)) throw new Error('no book exists');
        const book = await Book.findById(bookid).orFail(new Error('no book exists'));
        res.send({
          _id: book._id,
          title: book.title,
          comments: book.comments,
        });
      } catch (error) {
        if (error.message) {
          res.send(error.message);
        }
        next(error);
      }
    })

    .post(async (req, res, next) => {
      try {
        const bookid = req.params.id;
        const { comment } = req.body;
        // json res format same as .get
        if (!mongoose.Types.ObjectId.isValid(bookid)) throw new Error('no book exists');
        const book = await Book.findById(bookid).orFail(new Error('no book exists'));
        if (!comment) throw new Error('missing required field comment');
        book.comments.push(comment);
        await book.save();
        res.send({
          _id: book._id,
          title: book.title,
          comments: book.comments,
        });
      } catch (error) {
        if (error.message) {
          res.send(error.message);
        }
        next(error);
      }
    })

    .delete(async (req, res, next) => {
      // if successful response will be 'delete successful'
      try {
        const bookid = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(bookid)) throw new Error('no book exists');
        await Book.findByIdAndDelete(bookid).orFail(new Error('no book exists'));
        res.send('delete successful');
      } catch (error) {
        if (error.message) {
          res.send(error.message);
        }
        next(error);
      }
    });
};
