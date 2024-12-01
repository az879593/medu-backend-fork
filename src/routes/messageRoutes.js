// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middlewares/authenticationMiddleware');

router.post('/send', auth, messageController.sendMessage);
router.get('/messagehistory', auth, messageController.getAllMessageHistory);
router.get('/latestmessage', auth, messageController.getLatestMessage);

module.exports = router;