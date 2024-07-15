const fs = require('fs');

const moviesJson = fs.readFileSync('./data/movies.json'); 
const movies = JSON.parse(moviesJson);

exports.checkId = (req, res, next, value) => {
    console.log("Movie id is: " + value);
    // FIND MOVIE BASED ON ID PARAMETER
    const movie = movies.find(movie => movie.id === value * 1);

    if(!movie){
        return res.status(404).send({
            status: "fail",
            message: `Movie with ID ${value} is not found`
            
        });
    }

    next();
}

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
    res.status(200).json({
        status: "success",
        requestedAt: req.requestedAt,
        data: {
            movies: movies,

        },
        total: movies.length
    });
}

exports.createMovie = (req, res) => {

    const newId = movies[movies.length-1].id + 1;
    const newMovie = Object.assign({id: newId}, req.body);
    movies.push(newMovie);
    fs.writeFile('./data/movies.json', JSON.stringify(movies), (error) => {
        res.status(201).send({
            status: "success",
            data: {
                movie: newMovie,
            },
        });
    });
  
}

exports.getMovie = (req, res) => {

    // CONVERT ID TO NUMBER TYPE
    const id = req.params.id * 1;

    // FIND MOVIE BASED ON ID PARAMETER
    const movie = movies.find(movie => movie.id === id);

    // if(!movie){
    //     return res.status(404).send({
    //         status: "fail",
    //         message: `Movie with ID ${id} is not found`
            
    //     });
    // }

    res.status(200).send({
        status: "success",
        data: {
            movie: movie
        }
    });
}

exports.updateMovie = (req, res) => {
    const id = req.params.id * 1;

    const movieToUpdate = movies.find(movie => movie.id === id);

    // if(!movieToUpdate){
    //     return res.status(404).json({
    //         status: "failed",
    //         message: `No movies with id ${id} is found`
    //     });
    // }

    const index = movies.indexOf(movieToUpdate);

    Object.assign(movieToUpdate, req.body);

    movies[index] = movieToUpdate;

    fs.writeFile('./data/movies.json', JSON.stringify(movies), (err) => {
        res.status(200).json({
            status: "success",
            data: {
                movie: movieToUpdate,
            }
        });
    });
}

exports.deleteMovie = (req, res) => {
    const id = req.params.id * 1;
    const movieToDelete = movies.find(movie => movie.id === id);

    // if(!movieToDelete){
    //     return res.status(404).json({
    //         status: "failed",
    //         message: `No movie object with id ${id} is found to delete`
    //     });
    // }
 

    const index = movies.indexOf(movieToDelete);

    movies.splice(index, 1);

    fs.writeFile('./data/movies.json', JSON.stringify(movies), (err) => {
        res.status(204).json({
            status: "success",
            data: {
                movie: null
            }
        });
    });
}