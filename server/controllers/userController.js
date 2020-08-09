const User = require('../models/user');
const errorHandler = require('../utils/errorHandler');
const auth = require('../middleware/auth')
const responseHandler = require('../utils/responseHandler');

exports.register = async (req, res, next) => {
    try {
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
        if (!user || !(await auth.isPassword(password, user.password))) {
            return errorHandler(401, 'Incorrect username or password');
        }
        req.user = user;
        return next();
    } catch (error) {
        return next(error);
    }

};
