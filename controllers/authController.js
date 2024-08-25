const User = require('./../models/userModel');
const asyncErrorHandler = require('./../utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('./../utils/CustomError');
const util = require('util');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');
const { log } = require('console');


const signToken = id => {
    return jwt.sign({ id }, process.env.SECRET_STR, {
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

    if (!email || !password) {
        const error = new CustomError('Please provide email id and password for login in!', 400);
        return next(error); // always call global handling error
    }

    // Check if user exists with given email

    const user = await User.findOne({ email }).select('+password');

    // const isMatch = await user.comparePasswordInDb(password, user.password);

    // Check if ther user exists & password matches

    if (!user || !(await user.comparePasswordInDb(password, user.password))) {
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
    if (testToken && testToken.startsWith('Bearer')) {
        token = testToken.split(' ')[1]; // actual token without bearer

    }

    if (!token) {
        next(new CustomError('You are not logged in.', 401));
    }

    console.log(token);


    //2. validate the token

    const decodedToken = await jwt.verify(token, process.env.SECRET_STR);

    console.log(decodedToken);


    //3. If the user exists

    const user = await User.findById(decodedToken.id);

    if (!user) {
        const error = new CustomError('The user with given token does not exist', 401);
        next(error);
    }



    //4. If the user changed password after the token was issued

    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);

    if (isPasswordChanged) {   // iat ---> issuedAt
        const error = new CustomError('The password has been changed recently. Please login again.', 401);
        return next(error);
    }

    //5. After user to access route
    req.user = user;

    next();
});

// this wrapper function return middle ware function
exports.restrict = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            const error = new CustomError('You do not have permission to perform this action', 403);
            next(error);
        }
        next();
    }
}


// for multiple roles to perform same given action

exports.restrict = (...role) => {  // (... => rest operator => acts as array)
    return (req, res, next) => {
        if (!role.includes(req.user.role)) {
            const error = new CustomError('You do not have permission to perform this action', 403);
            next(error);
        }
        next();
    }
}

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {

    // 1. GET USER BASED ON POSTED EMAIL

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        const error = new CustomError('We could not find the user with given email', '400');
        next(error);
    }

    // 2. GENERATE A RANDOM RESET TOKEN

    const resetToken = user.createResetPasswordToken();

    await user.save({ validateBeforeSave: false });


    // 3. SEND THE TOKEN BACK TO THE USER DETAIL

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `We have received a password reset request: PLease use the below link to reser your password\n\n${resetUrl}\n\nThis password password link will be valid for 10 minutes.`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password change request recieved',
            message: message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Password reser link send to the user email'
        });

    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        user.save({ validateBeforeSave: false });

        return next(new CustomError('There was an error sending password reset email. Please try again later', 500));

    }

});

exports.resetPassword = asyncErrorHandler (async (req, res, next) => {

    // 1. IF THE USER EXISTS WITH THE GIVEN TOKEN AND TOKEN HAS NOT EXPIRED

    const requestToken = req.params.token;

    const hashedToken = crypto.createHash('sha256').update(requestToken).digest('hex');    

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetTokenExpires: {$gt: Date.now()}
    });

    if(!user){
        const error = new CustomError('Token is invalid or has expired', 400);
        next(error);
    }

    // 2. RESETING THE USER PASSWORD

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.isPasswordChangedAt = Date.now();

    await user.save();

    // 3. LOGIN THE USER
    
    const loginToken = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token: loginToken
    });



});