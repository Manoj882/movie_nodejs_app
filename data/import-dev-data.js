const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Movie = require('./../models/movieModel');

dotenv.config({path: './config.env'});

// CONNECT TO MONGODB
mongoose.connect(process.env.CONN_STR)
.then((conn) => {
    console.log('DB Connection Successful');
})
.catch((error) => {
    console.log('Some error has occured: ' + error);
});

// READ MOVIES.JSON FILE

const movies = JSON.parse(fs.readFileSync('./data/movies.json', 'utf-8'));

// DELETE EXISTING MOVIE DOCUMENTS FROM COLLECTION
const deleteMovie = async () => {
    try{
        await Movie.deleteMany();
        console.log('Data successfully deleted!');

    } catch(err){
        console.log(err.message);
    }
    process.exit();
}

// IMPORT MOVIES DATA TO MONGODB COLLECTION
const importMovie = async () => {
    try{
        await Movie.create(movies);
        console.log('Data successfully imported!');

    }catch(err){
        console.log(err.message);
    }
    process.exit();
}

if(process.argv[2] === '--import'){
    importMovie();
}

if(process.argv[2] === '--delete'){
    deleteMovie();
}