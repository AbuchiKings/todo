const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const errorHandler = require('../utils/errorHandler');
const responseHandler = require('../utils/responseHandler');
const crypto = require('crypto');
const util = require('util');



const SECRET = process.env.JWT_KEY;
const pbkd = util.promisify(crypto.pbkdf2Sync);
const iterations = parseInt(process.env.ITERATIONS, 10);
const hashBytes = parseInt(process.env.HASH_BYTES, 10);
const saltBytes = parseInt(process.env.SALT_BYTES, 10);


const auth = {
    logout(req, res, next) {
        if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
            const cookieOptions = {
                httpOnly: true,
                expires: new Date(Date.now() - process.env.JWT_EXPIRY_TIME * 1000 * 60 * 60 * 24)
            }
            res.cookie('jwt', token, cookieOptions);
        }
        return responseHandler(res, { message: "You have been successfully logged out" },
            next, 200, 'Youhave been successfully logged out', 0);
    },
    
    verifyToken(req, res, next) {
        const access = req.headers.authorization;
        let token;
        if (access && access.trim().length > 10) {
            let bearerToken = access.split(' ');
            token = bearerToken[1];

        } else if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) return errorHandler(401, 'Unauthorised. Please login with your details');

        jwt.verify(token, SECRET, (err, decodedToken) => {
            if (err) return errorHandler(401, 'Unauthorised. Please login with your details');
            req.user = decodedToken;
            return next();
        });
    },

    signToken: async (req, res, next) => {
        try {
            const { _id, email } = req.user;
            const token = jwt.sign({ _id, email }, SECRET, { expiresIn: process.env.JWT_EXPIRATION_TIMEFRAME });
            req.token = token;
            next();
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    addToken(req, res, next) {
        const token = req.token;
        const cookieOptions = {
            httpOnly: true,
            expires: new Date(Date.now() + process.env.JWT_EXPIRY_TIME * 1000 * 60 * 60 * 24)
        }
        cookieOptions.secure = req.secure || req.headers['x-forwarded-proto'] === 'https';

        if (process.env.NODE_ENV === 'production' && !cookieOptions.secure) {
            return errorHandler(401, 'You cannot be logged in when your network connection is not secure!');
        }
        const message = req.message || 'Successfully logged in'
        res.cookie('jwt', token, cookieOptions);
        return responseHandler(res, { token, ...req.user }, next, 200, message, 1);
    },

    hashPassword: async (password) => {
        console.log(`${iterations, hashBytes, saltBytes}`)
        const salt = crypto.randomBytes(saltBytes).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, iterations, hashBytes, 'sha512').toString('hex');
        return [salt, hash].join('$');
    },

    isPassword: async (password, dbPassword) => {
        const originalHash = dbPassword.split('$')[1];
        const salt = dbPassword.split('$')[0];
        const hash = crypto.pbkdf2Sync(password, salt, iterations, hashBytes, 'sha512').toString('hex');

        return hash === originalHash;

    }

}

module.exports = auth;
