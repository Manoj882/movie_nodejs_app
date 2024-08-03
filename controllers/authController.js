const User = require('./../models/userModel');
const asyncErrorHandler = require('./../utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('./../utils/CustomError');

const signToken = id => {
    return jwt.sign({id}, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    });
};

exports.signup = asyncErrorHandler(async (req, res, next) => {
    const newUser = await User.create(req.body);

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        }
    });
 });

 exports.login = asyncErrorHandler(async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    //const {email, password} = req.body;

    // check if email & password is present in request body

    if(!email || !password){
        const error = new CustomError('Please provide email id and password for login in!', 400);
        return next(error); // always call global handling error
    }

    // Check if user exists with given email

    const user = await User.findOne({email}).select('+password');

    // const isMatch = await user.comparePasswordInDb(password, user.password);

    // Check if ther user exists & password matches

    if(!user || !(await user.comparePasswordInDb(password, user.password))){
        const error = new CustomError('Incorrect email or password', 400);
        return next(error);
    }

    const token = signToken(user._id);


    res.status(200).json({
        status: 'success',
        token
    });
 });