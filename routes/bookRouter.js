const express = require("express");

function routes(Book) {
  const bookRouter = express.Router();

  bookRouter
    .route("/books")
    .post((req, res) => {
      const book = new Book(req.body);

      book.save();
      return res.status(201).json(book);
    })
    .get((req, res) => {
      // adding query at the end of URL but only if it is ?genre=something
      // otherwise it shows all the results
      const query = {};
      if (req.query.genre) {
        query.genre = req.query.genre;
      }
      Book.find(query, (err, books) => {
        if (err) {
          return res.send(err);
        }
        return res.json(books);
      });
    });

  // writing a middleware for finding book based on id in URL
  bookRouter.use("/books/:bookId", (req, res, next) => {
    Book.findById(req.params.bookId, (err, book) => {
      if (err) {
        return res.send(err);
      }
      if (book) {
        req.book = book;
        return next();
      }
      return res.sendStatus(404);
    });
  });
  // searching for a single item based on id in URL /api/books/5cffdadff6a6a92de8437549
  bookRouter
    .route("/books/:bookId")
    .get((req, res) => res.json(req.book))
    // updating book based on id in URL /api/books/5cffdadff6a6a92de8437549
    .put((req, res) => {
      // const book = req.book;
      const { book } = req;
      book.title = req.body.title;
      book.author = req.book.author;
      book.genre = req.book.genre;
      book.read = req.book.read;
      req.book.save(err => {
        if (err) {
          return res.send(err);
        }
        return res.json(book);
      });
    })
    // updating only those fields that were sent
    .patch((req, res) => {
      const { book } = req;
      /*
      if(req.body.title){
          book.title = req.body.title;
      }
      and like that for each field
      */

      // we do not want to change id field
      if (req.body._id) {
        delete req.body._id;
      }
      Object.entries(req.body).forEach(item => {
        const key = item[0];
        const value = item[1];
        book[key] = value;
      });
      req.book.save(err => {
        if (err) {
          return res.send(err);
        }
        return res.json(book);
      });
    })
    .delete((req, res) => {
      req.book.remove(err => {
        if (err) {
          return res.send(err);
        }
        // status for successfuly removed item
        return res.sendStatus(204);
      });
    });

  return bookRouter;
}

module.exports = routes;
