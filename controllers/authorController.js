const Author = require('../models/author')
const async = require('async')
const Book = require('../models/book')
const {body, validationResult} = require('express-validator')
//Mostramos todos los autores

exports.author_list = function(req, res, next){
    Author
    .find()
    .sort([['family_name', 'ascending']])
    .exec(function(err, list_authors){
        if(err) {return next(err)}

        res.render('author_list',{title: 'Author List', author_list: list_authors})
    })
}

//Mostrar detalles de un autor específico

exports.author_detail = function(req, res, next){

    async.parallel({
        author: function(callback){
            Author
            .findById(req.params.id)
            .exec(callback)
        },
        author_book: function(callback){
            Book
            
            .find({'author': req.params.id},'title summary')
            .exec(callback)
            
        }
    },
    function(err, results){
        if(err) {return next(err)}
        if(results.author == null){
            const err = new Error('Author not found')
            err.status = 404
            return next(err)
        }

        res.render('author_details', {title: 'Author detail', authors: results.author, authors_books: results.author_book})
    }
    
    )

}

//Formulario para crear autores con GET (DISPLAY)

exports.author_create_get = function(req, res, next){
    res.render('author_form', {title: 'Create Author'})
}

//Manejador de Author con POST

exports.author_create_post = [
    //validamos los datos del formulario
    //en body ponemos el name del form
    //trim para quitar los espacios en blanco
    //islength para establecer una longitud min para mínimo y max para máximo
    //escape para evitar codigo malicioso o inyecciones de codigo a través del formulario
    //withMessage para que en caso de incumplimiento de alguna orden salte un mensaje
    //isAlphanumeric para que no solo se puedan poner números en el input
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified').isAlphanumeric().withMessage('First name has non-alphanumeric characters'),

    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified').isAlphanumeric().withMessage('Family name has non-alphanumeric characters'),

    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true}).isISO8601().toDate(),

    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true}).isISO8601().toDate(),

    (req, res, next) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()){
            res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array()})
            return
        }else{
            var author = new Author(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                })
            
            author.save(function (err) {
                if(err) {return next(err)}
                res.redirect(author.url)
            })
        }
    }
]

//Formulario de DELETE para Author GET(DISPLAY)

exports.author_delete_get = function(req, res){

    async.parallel({

        author: function(callback){
            Author
            .findById(req.params.id)
            .exec(callback)
        },
        authors_books: function(callback){
            Book
            .find({'author': req.params.id})
            .exec(callback)
        }
    }, function(err, results){
        if (err) {return next(err)}
        if (results == null) {res.redirect('catalog/authors')}

        res.render('author_delete', {title: 'Delete Author', author: results.author, author_books: results.author_books})
    })
}

//Formulario de DELETE para Author POST

exports.author_delete_post = function(req, res, next){

    async.parallel({

        author: function(callback){
            Author
            .findById(req.body.authorid)
            .exec(callback)
        },
        authors_books: function(callback){
            Book
            .find({'author': req.body.authorid})
            .exec(callback)
        }
    }, function(err, results){
        if (err) {return next(err)}
        if (results.author_books.length > 0) {
            res.render('author_delete',{title: 'Delete author', author: results.author, author_books: results.authors_books})
            return
        }else{
            Author
            .findByIdAndDelete(req.body.authorid, function deleteAuthor(err){
                if(err) {return next(err)}
                res.redirect('catalog/authors')

            })
        }

        res.render('author_delete', {title: 'Delete Author', author: results.author, author_books: results.author_books})
    })

    res.send('NOT IMPLEMENTED NOW: Author Delete POST')
}

//Formulario de UPDATE para Author GET(DISPLAY)

exports.author_update_get = function(req, res){
    res.send('NOT IMPLEMENTED NOW: Author Update GET')
}

//Formulario de UPDATE para Author POST

exports.author_update_post = function(req, res){
    res.send('NOT IMPLEMENTED NOW: Author Update POST')
}