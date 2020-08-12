const User = require('../models/user');
const errorHandler = require('../utils/errorHandler');
const auth = require('../middleware/auth')
const responseHandler = require('../utils/responseHandler');

exports.register = async (req, res, next) => {
    try {
        const oldUser = await User.findOne({email: req.body.email.toLowerCase()});
        if(oldUser){
            return errorHandler(409, 'Email already in use');
        }
        const user = await User.create({ ...req.body, registeredOn: Date() });
        return responseHandler(res, user, next, 201, 'You have been successfully registered');
    } catch (error) {
        return next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return errorHandler(400, 'Please provide your username and password');
        }
        const user = await User.findOne({ email }).select('+password').lean();
        const isPassword = user ? await auth.isPassword(password, user.password) : false;
        if (!user || isPassword !== true) {
            return errorHandler(401, 'Incorrect email or password');
        }
        req.user = user;
        return next();
    } catch (error) {
        return next(error);
    }

};
