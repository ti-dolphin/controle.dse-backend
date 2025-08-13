
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authorize = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" });
      } else {
        next();
      }
    });
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, token not available" });
  }
};

const getToken = () => {
  return jwt.sign({}, process.env.JWT_SECRET, { expiresIn: "24h" });
};
module.exports = { authorize, getToken };