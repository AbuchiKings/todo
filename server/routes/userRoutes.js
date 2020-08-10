const express = require('express');
const User = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', User.register);
router.post('/login', User.login, auth.signToken, auth.addToken);
router.get('/logout', auth.verifyToken, auth.logout);

module.exports = router;