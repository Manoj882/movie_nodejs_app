const mongoose = require('mongoose');
const validator = require('validator')

// name, email, password, confirm password, photo

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name.']
    },
    email: {
        type: String,
        required: [true, 'Please enter an email.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email.']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please enter a password.'],
        minLength: 8,
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please enter confirm password.']
    }
});

const User = mongoose.Model('User', userSchema);

module.exports = User;