const mongoose = require('mongoose');
const validator = require('validator');
const auth = require('../middleware/auth')

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Please Provide Your Full Name'],
        trim: true
    },
    email: {
        type: String,
        unique: [true, 'This email already exists!'],
        validate: {
            validator: function (value) {
                return validator.isEmail(value);
            },
            message: 'Please provide a valid email address'
        },
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [8, 'Your password must consist of at least 8 characters'],
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (value) {
                return value === this.password;
            },
            message: 'Passwords do not match'
        },
        select: false
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await auth.hashPassword(this.password);
    this.confirmPassword = undefined;
    next();
});


module.exports = mongoose.model('User', userSchema);