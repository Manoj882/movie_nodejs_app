const express = require('express');
const morgan = require('morgan')
const moviesRouter = require('./routes/moviesRoutes');
const authRouter = require('./routes/authRoutes');
const CustomError = require('./utils/CustomError');
const globalErrorHandler = require('./controllers/errorController');

let app = express();

const logger = function(req, res, next){
    console.log('Custom middleware called');
    next();
}

app.use(express.json());

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}


app.use(express.static('./public'))
app.use(logger);

app.use((req, res, next) => {
    req.requestedAt = new Date().toISOString();
    next();

});


app.use('/api/v1/users', authRouter);  
app.use('/api/v1/movies', moviesRouter);   

// Default Routes
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on the server!`
    // });

    // const err = new Error(`Can't find ${req.originalUrl} on the server!`);
    // err.status = 'fail';
    // err.statusCode = 404;

    const err = new CustomError(`Can't find ${req.originalUrl} on the server!`);
    next(err);
});

app.use(globalErrorHandler);

module.exports = app;