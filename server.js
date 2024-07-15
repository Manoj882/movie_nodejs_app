const mongoose = require('mongoose')
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const app = require('./app')

// console.log(app.get('env'));

console.log(process.env);

mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((conn) => {
    // console.log(conn);
    console.log('DB Connection Successful...');
}).catch((error) => {
    console.log('Some error has occured.');
});


const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required : [true, 'Name is required field!'],
        unique: true
    },
    description: String,
    duration: {
        type: Number,
        required: [true, 'Duration is required field!']
    },
    rating: {
        type: Number,
        default: 1.0
    },

});

const Movie = mongoose.model('Movie', movieSchema);


// CREATER SERVER   
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Server has started...');
});