const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/Usermodel");

// register
const register = async (req, res) => {
  const { username, password } = req.body;

  try {
    // check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    // send response
    res.status(201).send("User registered");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering user");
  }
};

// login
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send("User not found");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).send("Invalid password");
    }

    const token = jwt.sign({ username: user.username }, "jwtSecret", { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).send("Error logging in");
  }
};

module.exports = {
  register,
  login,
};