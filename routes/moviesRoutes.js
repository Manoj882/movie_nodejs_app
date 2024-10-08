const express = require('express')
const moviesController = require('./../controllers/moviesController')
const authController = require('./../controllers/authController');

const router = express.Router();  // act as middleware

// router.param('id', (req,res, next, value) => {
//     console.log("Movie id is: " + value);
//     next();
// });

//router.param('id', moviesController.checkId);

router.route('/highest-rated').get(moviesController.getHighestRated, moviesController.getAllMovies);

router.route('/')
    .get(authController.protect, moviesController.getAllMovies)
    .post(moviesController.createMovie);

router.route('/:id')
    .get(authController.protect, moviesController.getMovie)    
    .patch(moviesController.updateMovie)
    .delete(authController.protect, authController.restrict('admin'), moviesController.deleteMovie);

module.exports = router;