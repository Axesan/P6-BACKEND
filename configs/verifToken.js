

exports.verifyToken = (req, res, next) => {
    const jwt = require('jsonwebtoken');
    require('dotenv').config(); // Accés au .env
    const jwtSecret = process.env.TOKEN_USER;
    const token = req.headers.authorization.split(' ')[1]; // Y a le mot Bearer avant d'où le split
    //const token = req.headers.authorization
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" });
      } else {
        req.user = decodedToken;
        console.log("Verif Token decodedToken :",decodedToken);
        next();
        
      }
    });
  } else {
    return res.status(401).json({ message: "Not authorized" });
  }
};