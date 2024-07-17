const fs = require('fs');
const Movie = require('./../models/movieModel')

const moviesJson = fs.readFileSync('./data/movies.json'); 
const movies = JSON.parse(moviesJson);

exports.getAllMovies = async (req, res) => {
    try{

        // const excludeFields = ['sort', 'page', 'limit', 'fields'];

        // const queryObj = {...req.query}; // create swallow copy

        // excludeFields.forEach((el) => {
        //     delete queryObj[el];
        // });

        let queryStr = JSON.stringify(req.query);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        const queryObj = JSON.parse(queryStr);
       // console.log(queryObj);

        if(req.query.sort){
            delete queryObj.sort;
        }

        let query =  Movie.find(queryObj);

        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            // console.log(sortBy);
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt')
        }

        const movies = await query;

        res.status(200).json({
            status: 'success',
            data: {
                movies
            },
            totalCount: movies.length,
        });
    } catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
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

exports.getMovie = async (req, res) => {
    try{
        // const movie = await Movie.find({_id: req.params.id});

        const movie = await Movie.findById(req.params.id);

        res.status(200).json({
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

exports.updateMovie = async (req, res) => {
    try{
        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

        res.status(200).json({
            status: 'success',
            data: {
                movie: updatedMovie
            }
        });

    } catch(err){
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }

}

exports.deleteMovie = async (req, res) => {
    try{
        await Movie.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });

    } catch(err){
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
}