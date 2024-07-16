const fs = require('fs');
const Movie = require('./../models/movieModel')

const moviesJson = fs.readFileSync('./data/movies.json'); 
const movies = JSON.parse(moviesJson);


exports.validateBody = (req, res, next) => {
    if(!req.body.name || req.body.releaseYear){
        return res.status(400).json({
            status: "failed",
            message: 'Not a valid movie data'
        });
    }
    next();
}

exports.getAllMovies = (req, res) => {
 
}

exports.createMovie = (req, res) => {
  
}

exports.getMovie = (req, res) => {

}

exports.updateMovie = (req, res) => {

}

exports.deleteMovie = (req, res) => {
    
}