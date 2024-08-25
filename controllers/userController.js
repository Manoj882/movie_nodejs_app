const User = require('./../models/userModel');
const asyncErrorHandler = require('./../utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('./../utils/CustomError');
const util = require('util');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

const authController = require('./authController');

const filterRefObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(prop => {
        if(allowedFields.includes(prop)){
            newObj[prop] = obj[prop];
        }
    });
    return newObj;
}


exports.changePassword = asyncErrorHandler( async(req, res, next) => {
    
    // 1. GET CURRENT USER DATA FROM DATABASE

    const user = await User.findById(req.user._id).select('+password');

    // 2. CHECK IF THE SUPPIED CURRENT PASSWORD IS CORRECT

    if(!(await user.comparePasswordInDb(req.body.currentPassword, user.password))){
        return next(new CustomError('The current password you provided is wrong', 401));

    }

    // 3. IF SUPPIED PASSWORD IS CORRECT, UPDATE USER PASSWORD WITH NEW VALUE

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    await user.save();

    // 4. LOGIN USER AND SEND JWT

    authController.createSendResponse(user, 200, res);

});

exports.updateMe = asyncErrorHandler(async (req,res,next) => {

    // 1. CHECK IF REQUEST DATA CONTAIN PASSWORD OR CONFIRM PASSWORD
    if(req.body.password || req.body.confirmPassword){
        return next(new CustomError('You cannot update your password using this endpoint', 400));
    }

    // 2. UPDAT USER DETAIL

    const filterObj = filterRefObj(req.body, 'name', 'email');

    const updateUser = await User.findByIdAndUpdate(req.user._id, filterObj,{runValidators: true, new: true});

    res.status(200).json({
        status: 'success',
        data: {
            user: updateUser
        }
    });
    
});