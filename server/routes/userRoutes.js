const express = require('express');
const User = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();
const { validateSignup, validateLogin, validationHandler } = require('../middleware/validator')

router.post('/register', validateSignup, validationHandler, User.register);
router.post('/login', validateLogin[0], validationHandler, User.login, auth.signToken, auth.addToken);
router.get('/logout', auth.verifyToken, auth.logout);

module.exports = router;