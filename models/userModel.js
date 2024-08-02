const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
        required: [true, 'Please enter confirm password.'],
        validate: {
            // This validator will only work for save() & create() not for update(), findOne()
            validator: function(val){
                return val == this.password;
            },
            message: 'Password & Confirm Password does not match!'
        }
    }
});

// pre-save middleware  ---> perform before saving the data in database
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    //encrypt the passsword before saving it
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();

});1

const User = mongoose.model('User', userSchema);

module.exports = User;