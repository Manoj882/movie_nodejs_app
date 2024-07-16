const express = require('express')
const moviesController = require('./../controllers/moviesController')

const router = express.Router();  // act as middleware

// router.param('id', (req,res, next, value) => {
//     console.log("Movie id is: " + value);
//     next();
// });

//router.param('id', moviesController.checkId);

router.route('/')
    .get(moviesController.getAllMovies)
    .post(moviesController.validateBody, moviesController.createMovie);

router.route('/:id')
    .get(moviesController.getMovie)    
    .patch(moviesController.updateMovie)
    .delete(moviesController.deleteMovie);

module.exports = router;