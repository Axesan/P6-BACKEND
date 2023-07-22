const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController.js');
const productController = require('../controllers/productController.js');
const { verifyToken } = require('../configs/verifToken.js');




// Définir les routes - Login, Register
router.post('/auth/login', loginController.login);
router.post('/auth/signup', loginController.signup);

// Définir les routes - sauces
router.get('/sauces',verifyToken, productController.sauces);
router.post('/sauces',verifyToken, productController.addSauces);
router.get('/sauces/:id',verifyToken, productController.saucesById);
router.put('/sauces/:id',verifyToken, productController.updateSauce);
router.delete('/sauces/:id', verifyToken, productController.deleteSauce);
router.post('/sauces/:id/like',verifyToken, productController.likeSauces)

module.exports = router;