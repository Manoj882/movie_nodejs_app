const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
    password: {



        type: String,
        required: [true, 'Please enter a password.'],
        minLength: 8,
        select: false,
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
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,

});

// pre-save middleware  ---> perform before saving the data in database
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    //encrypt the passsword before saving it
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();

});

userSchema.methods.comparePasswordInDb = async function(psw, pswDB){
   return await bcrypt.compare(psw, pswDB);
}


userSchema.methods.isPasswordChanged = async function(JWTTimestamp){
    if(this.passwordChangedAt){
        const passwordChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(passwordChangedTimestamp, JWTTimestamp);

        return JWTTimestamp < passwordChangedTimestamp;
        

    }
    return false;
}

userSchema.methods.createResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    const now = Date.now();

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires = now + 10 * 60 * 1000;

    console.log(resetToken, this.passwordResetToken);
    
    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;