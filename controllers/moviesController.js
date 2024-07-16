const fs = require('fs');
const Movie = require('./../models/movieModel')

const moviesJson = fs.readFileSync('./data/movies.json'); 
const movies = JSON.parse(moviesJson);

exports.getAllMovies = (req, res) => {
 
}

exports.createMovie = async (req, res) => {
//   const testMovie = new Movie({});
//   testMovie.save();

 try{
    const movie = await Movie.create(req.body);
    
    res.status(201).json({
        status: 'success',
        data: {
            movie
        }
    });
 } catch(err){
    res.status(400).json({
        status: 'fail',
        message: err.message
    });

 }


}

exports.getMovie = (req, res) => {

}

exports.updateMovie = (req, res) => {

}

exports.deleteMovie = (req, res) => {
    
}