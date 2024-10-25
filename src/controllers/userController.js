const User = require('../models/User');
const jwt = require('jsonwebtoken');

// register
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    // check user exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User is existed' });
    }
    // create user
    user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'register success' });
  } catch (error) {
    res.status(500).json({ message: 'server error' });
  }
};

// login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    // check user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User or password is not correct' });
    }
    // check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'User or password is not correct' });
    }
    // Gen JWT
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: '1h', // 1 hour expires
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'server error' });
  }
};
