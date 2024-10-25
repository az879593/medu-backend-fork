const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const auth = require('../middlewares/authenticationMiddleware');

router.use('/user', userRoutes);
// router.use("/userRelationship", userRelationshipRoutes);

module.exports = router;
