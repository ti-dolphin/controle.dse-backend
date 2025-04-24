
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authorize = (req, res, next) => {
 const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, process.env.SECRET_TOKEN, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" });
      } else {
          next()
        }
    });
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, token not available" });
  }
};
module.exports = authorize;