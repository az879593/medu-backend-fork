const express = require("express");
const userController = require("../controllers/UserController"); 

const router = express.Router();

// register route
router.post("/register", userController.register);

// login route
router.post("/login", userController.login);

// 導出 module router
module.exports = router;