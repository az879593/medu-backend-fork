const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {

  // Get the token from the request headers
  const authHeader = req.headers.authorization;

  // Ensure authHeader is set
  if (!authHeader) {
    console.log("Token not provided");
    return res.status(401).json({ message: "Token not provided" });
  }

  // Get the token part
  const token = authHeader.split(" ")[1];

  // Ensure the token is properly extracted
  if (!token) {
    console.log("Token format is incorrect");
    return res.status(401).json({ message: "Token format is incorrect" });
  }

  try {
    // Testing the token and secret key
    console.log("Received token:", token);
    console.log("SECRET_KEY used for verification:", process.env.SECRET_KEY);

    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Decoded token:", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};
