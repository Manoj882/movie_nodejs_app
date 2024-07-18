const mongoose = require('mongoose');
const fs = require('fs')

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required : [true, 'Name is required field!'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required field!'],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required field!']
    },
    ratings: {
        type: Number,
    },
    totalRating: {
        type: Number,
    },
    releaseYear: {
        type: Number,
        required: [true, 'Release year is required field!']
    },
    releaseDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    genres: {
        type: [String],
        required: [true, 'Genres is required field!']
    },
    directors: {
        type: [String],
        required: [true, 'Directors is required field!']
    },
    coverImage: {
        type: String,
        required: [true, 'Cover image is required field!']
    },
    actors: {
        type: [String],
        required: [true, 'Actors is required field!']
    },
    price: {
        type: Number,
        required: [true, 'Price is required field!']
    },
    createdBy: String

}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

movieSchema.virtual('durationInHours').get(function(){
    return this.duration / 60;
});

// EXECUTED BEFORE THE DOCUMENT IS SAVED IN DB
// .save() or .create()

movieSchema.pre('save', function(next){
    this.createdBy = 'Manoj BK';
    console.log(this);
    next();
});

movieSchema.post('save', function(doc, next){
    const content = `A new movie document with name ${doc.name} has been created by ${doc.createdBy}\n`;

    fs.writeFileSync('./log/log.txt', content, {flag: 'a'}, (err) => {
        console.log(err.message);
    });
    next();
});

movieSchema.pre(/^find/, function(next){  // for both find() and findOne()
    this.find({releaseDate: {$lte: Date.now()}});
    this.startTime = Date.now();
    next();
});

movieSchema.post(/^find/, function(docs, next){ 
    this.find({releaseDate: {$lte: Date.now()}});
    this.endTime = Date.now();

    const content = `Query took ${this.endTime - this.startTime} milliseconds to fetch the documents.`;

    fs.writeFileSync('./log/log.txt', content, {flag: 'a'}, (err) => {
        console.log(err.message);
    });
    next();
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;