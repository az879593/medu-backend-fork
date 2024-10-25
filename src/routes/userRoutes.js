// routes/UserRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/AuthenticationMiddleware');

// register route
router.post('/register', userController.register);

// login route
router.post('/login', userController.login);

// Use JWT profile
// It can improve in the UserController.js
router.get('/profile', auth, (req, res) => {
  res.json({ message: 'Is protected token', userId: req.user.userId });
});

module.exports = router;