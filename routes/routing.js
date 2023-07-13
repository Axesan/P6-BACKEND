const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController.js');
const productController = require('../controllers/productController.js');




// Définir les routes
router.post('/auth/login', loginController.login);
router.post('/auth/signup', loginController.signup);
router.get('/sauces', productController.sauces);
router.post('/sauces', productController.saucesRequest);
router.get('/sauces/:id', productController.saucesById);
router.put('/sauces/:id', productController.updateSauce);
router.delete('/sauces/:id', productController.deleteSauce);
router.post('/sauces/:id/like', productController.likeSauces)

module.exports = router;