const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


// Show list of all books
router.get('/', (req, res) => {
  Book.findAll().then(books => {
    res.render("index", {books, title: "Library"});
  }).catch(error => {
    res.send(500, error);
    });
});


// Display form to create book
router.get('/new', (req, res) => {
  res.render('new-book', {book: {}, title: "New Book"});
});


// Add book to database
router.post('/new', (req, res) => {
  Book.create(req.body).then(() => {
    res.redirect('/books');
     }).catch(error => {
      if(error.name === "SequelizeValidationError") {
        res.render("new-book", {book: Book.build(req.body), errors: error.errors, title: "Error"});
      } else {
        throw error;
      };
  }).catch(error => {
      res.send(500, error);
    });
});

// Search for book
router.get("/search", (req, res) => {
  const { search } = req.query
  Book.findAll({
    where: {
      [Op.or]: [
        {title: {[Op.like] : `%${search}%`}},
        {author: {[Op.like] : `%${search}%`}},
        {genre: {[Op.like] : `%${search}%`} },
        {year: {[Op.like] : `%${search}%`}}
      ]
    }
  }).then(books => {
    if (books.length > 0) {
      res.render('index', {books, title: "Search Results"});
    }else{
      res.render('page-not-found', {message: "search", title: "Not Found"});
    }
  }).catch(error => {
      res.send(500, error);
    });
 });


// Display book information on main page
router.get("/:id", (req, res) => {
  Book.findByPk(req.params.id).then(book => {
   if(book){
     res.render('update-book', {book, title:"Update Book"});
   }else{
     res.render('page-not-found', {message: "page", title: "Not Found"});
   }
  }).catch(error => {
      res.send(500, error);
    });
});


// Update book changes to database
router.post("/:id", (req, res) => {
  Book.findByPk(req.params.id).then(book => {
    if(book) {
      return book.update(req.body);
    } else {
      res.send(404);
    }
  }).then(() => {
    res.redirect("/books");        
  }).catch(error => {
      if(error.name === "SequelizeValidationError") {
        let book = Book.build(req.body);
        book.id = req.params.id;
        res.render('update-book', {book, errors: error.errors, title:"New Book"});
      } else {
        throw error;
      };
  }).catch(error => {
      res.send(500, error);
    });
});


// Delete book
router.post("/:id/delete", (req, res) => {
  Book.findByPk(req.params.id).then(book => { 
    book ? book.destroy() : res.send(404);
  }).then(() => {
    res.redirect("/books");    
  }).catch(error => {
      res.send(500, error);
    });
});

module.exports = router;