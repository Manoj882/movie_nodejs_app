const User = require('./../models/userModel');
const asyncErrorHandler = require('./../utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('./../utils/CustomError');
const util = require('util');


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


 exports.prtoect = asyncErrorHandler(async (req, res, next) => {

    // 1. Read the token and check if it exist

    const testToken = req.headers.authorization;
    
    let token;
    if(testToken && testToken.startsWith('bearer')){
         token = testToken.split(' ')[1]; // actual token without bearer

    }

    if(!token){
        next(new CustomError('You are not logged in.', 401));
    }

    console.log(token);
    

    //2. validate the token

    const decodedToken = await jwt.verify(token, process.env.SECRET_STR);

    console.log(decodedToken);
    

    //3. If the user exists

    const user = await User.findById(decodedToken.id);

    if(!user){
        const error = new CustomError('The user with given token does not exist', 401);
        next(error);
    }



    //4. If the user changed password after the token was issued

    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
    
    if(isPasswordChanged){   // iat ---> issuedAt
        const error = new CustomError('The password has been changed recently. Please login again.', 401);
        return next(error);
    } 

    //5. After user to access route
    req.user = user;

    next();
 });