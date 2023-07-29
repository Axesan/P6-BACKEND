exports.verifyToken = (req, res, next) => {
  const jwt = require('jsonwebtoken');
  require('dotenv').config(); // Accès au .env
  const jwtSecret = process.env.TOKEN_USER;
  const token = req.headers.authorization.split(' ')[1]; // Y a le mot Bearer avant d'où le split
  //const token = req.headers.authorization
  if (token) {
    try {
      const decodedToken = jwt.verify(token, jwtSecret);
      req.user = decodedToken;
      next();
    } catch (err) {
      console.error("Erreur lors de la vérification du token :", err);
      return res.status(401).json({ message: "Not authorized" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized" });
  }
};