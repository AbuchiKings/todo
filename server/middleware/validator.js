const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const errorHandler = require('../utils/errorHandler');


const validateLogin = [
    body('email')
        .exists()
        .withMessage('A valid email must be provided.')
        .normalizeEmail({ all_lowercase: true })
        .isEmail()
        .withMessage('Invalid email address.'),
    body('password')
        .exists()
        .withMessage('User password must be provided.')
        .isLength({ min: 5 })
        .withMessage('Passwords must be up to five(5) characters.')
];

const validateSignup = [
    body('fullname')
        .exists()
        .withMessage('Name field cannot be empty.')
        .isString()
        .custom((value) => {
            if (value !== undefined) {
                const val = value.split(' ');
                const check = val[0] && val[1];
                return check && val[0].replace(/\s+/g, '').trim().length > 2 &&
                    val[1].replace(/\s+/g, '').trim().length > 2;
            }
        })
        .withMessage('First name and last name must have a minimun of three(3) letters.'),
    validateLogin[0],
    validateLogin[1],
    body('password')
        .custom((value, { req }) => {
            return value === req.body.confirmPassword
        })
        .withMessage('Passwords do not match.'),
];

const validateId = [
    param('task_id')
        .exists()
        .withMessage('Provide a task_id')
        .custom(value => {
            return mongoose.Types.ObjectId.isValid(value);
        })
        .withMessage('Invalid task id')

];

const validateTask = [
    body('task')
        .exists()
        .withMessage('You haven\'t entered any text')
        .isLength({ min: 5 })
        .withMessage('Task must have a minimum of 5 characters'),
    //sanitize('task')
];

const validationHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return errorHandler(422, errors.array()[0].msg)
    } else {
        next();
    }
};

const validator = {
    validateLogin,
    validateSignup,
    validateId,
    validateTask,
    validationHandler
};

module.exports = validator;
