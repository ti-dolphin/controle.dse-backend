
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authorize = (req, res, next) => {
 const token = req.headers.authorization;
  if (token) {
    console.log("token: ", token);
    console.log("jwt secret: ", process.env.JWT_SECRET);
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        console.log(err);
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
module.exports = authorize;