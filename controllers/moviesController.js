
const Movie = require('./../models/movieModel');

const ApiFeatures = require('./../utils/ApiFeatures');
const asyncErrorHandler = require('./../utils/asyncErrorHandler');


exports.getHighestRated = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratings';
    next();
}

exports.getAllMovies = asyncErrorHandler(async(req, res, next) => {
   
        const features = new ApiFeatures(Movie.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        let movies = await features.query;    

        res.status(200).json({
            status: 'success',
            totalCount: movies.length,
            data: {
                movies
            },      
        });
});


exports.createMovie = asyncErrorHandler(async (req, res, next) => {

    const movie = await Movie.create(req.body);
    
    res.status(201).json({
        status: 'success',
        data: {
            movie
        }
    });
});

exports.getMovie = asyncErrorHandler(async (req, res, next) => {
    
        const movie = await Movie.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                movie
            }
        });
});

exports.updateMovie = asyncErrorHandler(async (req, res, next) => {

        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

        res.status(200).json({
            status: 'success',
            data: {
                movie: updatedMovie
            }
        });
});

exports.deleteMovie = asyncErrorHandler(async (req, res, next) => {
   
        await Movie.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
});