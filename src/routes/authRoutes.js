const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// register route
router.post("/register", authController.register);

// login route
router.post("/login", authController.login);

// 導出 module router
module.exports = router;