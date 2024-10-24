// routes/UserRoutes.js

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middlewares/AuthenticationMiddleware');

// register route
router.post('/register', UserController.register);

// login route
router.post('/login', UserController.login);

// Use JWT profile
// It can improve in the UserController.js
router.get('/profile', auth, (req, res) => {
  res.json({ message: 'Is proct', userId: req.user.userId });
});

module.exports = router;