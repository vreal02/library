const Book = require('../models/book')
const Author = require('../models/author')
const BookInstance = require('../models/bookinstance')
const Genre = require('../models/genre')
const {body, validationResult} = require('express-validator')
const async = require('async')

exports.index = function(req, res){

    async.parallel({

        book_count: function(callback){
            Book.countDocuments({},callback)
        },
        book_instance_count: function(callback){
            BookInstance.countDocuments({},callback)
        },
        book_instance_available_count: function(callback){
            BookInstance.countDocuments({status: 'Available'},callback)
        },
        author_count: function(callback){
            Author.countDocuments({},callback)
        },
        genre_count: function(callback){
            Genre.countDocuments({},callback)
        }
    },
    function(err, results){

        res.render('index', {title: 'Local Library Home', error: err, data: results})

    }) 
}

//Mostramos todos los book

exports.book_list = function(req, res, next){

    Book
    .find({}, 'title author')
    .sort({title: 1})
    .populate('author')
    .exec(function(err,list_books){
        if (err) {return next(err)}
        
        res.render('book_list',{title: 'Book List', book_list: list_books})
        
    })
    
}

//Mostrar detalles de un book específico

exports.book_detail = function(req, res, next){

    async.parallel({
        book: function(callback){
            Book
            .findById(req.params.id)
            .populate('author')
            .populate('genre')
            .exec(callback)
        },
        book_instance: function(callback){
            BookInstance
            .find({'book': req.params.id})
            .exec(callback)
        }
    },
    function(err, results){
        if(err){return next(err)}
        if(results.book == null){
            const err = new Error('book not found')
            err.status = 404
            return next(err)
        }

        res.render('book_details', {title: 'Book Detail', book: results.book, book_instances: results.book_instance})

    }
    )
}

//Formulario para crear book con GET (DISPLAY)

exports.book_create_get = function(req, res, next){
    async.parallel({

        authors: function(callback){
            Author.find(callback)
        },

        genres: function(callback){
            Genre.find(callback)
        }

    },function(err,results){
        if (err) {return next(err)}

        res.render('book_form',{title: 'Create book', authors: results.authors, genres: results.genres})
    })
}

//Manejador de book con POST

exports.book_create_post = [

    //Convertir el genre a un array
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)){
            if (typeof req.body.genre === 'undefined')
                req.body.genre = []
            else
                req.body.genre = new Array(req.body.genre)
        }
        next()
    },
    //Validamos y saneamos los datos
    body('title','Title must not be empty').trim().isLength({min: 1}).escape(),
    body('author','Author must not be empty').trim().isLength({min: 1}).escape(),
    body('summary','Summary must not be empty').trim().isLength({min: 1}).escape(),
    body('isbn','ISBN must not be empty').trim().isLength({min: 1}).escape(),
    body('genre.*').escape(),

    //Procesamos los datos validados y saneados
    (req, res, next) => {
        
        const errors = validationResult(req)

        var book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        })

        if (!errors.isEmpty()){
            async.parallel({

                authors: function(callback){
                    Author.find(callback)
                },
        
                genres: function(callback){
                    Genre.find(callback)
                }
        
            },function(err,results){
                if (err) {return next(err)}

                for(let i = 0; i < results.genres.length; i++){
                    if(book.genre.indexOf(results.genres[i]._id) > -1){
                        results.genres[i].checked = 'true'
                    }
                }
        
                res.render('book_form',{title: 'Create book', authors: results.authors, genres: results.genres, book: book, errors: errors.array()})
            })
            return
        }else{
            //data book are correct
            book.save(function(err){
                if(err) {return next(err)}
                res.redirect(book.url)
            })
        }
    }
]

//Formulario de DELETE para book GET(DISPLAY)

exports.book_delete_get = function(req, res){
    res.send('NOT IMPLEMENTED NOW: book Delete GET')
}

//Formulario de DELETE para book POST

exports.book_delete_post = function(req, res){
    res.send('NOT IMPLEMENTED NOW: book Delete POST')
}

//Formulario de UPDATE para book GET(DISPLAY)

exports.book_update_get = function(req, res){
    res.send('NOT IMPLEMENTED NOW: book Update GET')
}

//Formulario de UPDATE para book POST

exports.book_update_post = function(req, res){
    res.send('NOT IMPLEMENTED NOW: book Update POST')
}