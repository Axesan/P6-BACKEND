const configs = require('../configs/connectDatabase')
const mongoose = require('mongoose');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const verifToken = require('../configs/verifToken');



function decodedToken(tokenUserId){
  const secretKey = process.env.TOKEN_USER; // Assurez-vous d'utiliser la même clé secrète utilisée pour signer le tokenUserId
  const decodedToken = jwt.verify(tokenUserId, secretKey);
  const userId = decodedToken.userId;
  console.log('ID de l\'utilisateur :', userId);
  return userId;
}


// Définition du schéma pour la collection sauces
const sauceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  usersLiked: { type: [String], default: [] },
  usersDisliked: { type: [String], default: [] }
});

// Création du modèle basé sur le schéma
const Sauce = mongoose.model('sauces', sauceSchema);


// function methode get
async function sauces(req, res) {
    try {
    // Récupération de toutes les sauces à l'aide du modèle Sauce
    const sauces = await Sauce.find({}).exec(); //RENVOIE UN TABLEAU
    res.send( sauces );
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur serveur');
    }
  }
// Function by id
async function saucesById(req, res) {
    const sauceId = req.params.id;
  
    try {
      // Recherche de la sauce par ID à l'aide du modèle Sauce
      const sauce = await Sauce.findById(sauceId).exec();
  
      if (!sauce) {
        // Si la sauce n'est pas trouvée, renvoie une réponse avec un statut 404 (Non trouvé)
        return res.status(404).send('Sauce non trouvée');
      }
  
      // Envoi des informations de la sauce dans la réponse
      res.send(sauce);
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur serveur');
    }
}


// Configuration de multer pour gérer l'upload de l'image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
 

// Function method Post - A review
function addSauces(req,res) {
  
  
    const { name, manufacturer, description, mainPepper, heat,image } = req.body;
    
    const upload = multer({ storage: storage });
    // const token = req.headers.authorization;
    const token = req.headers.authorization.split(' ')[1]
    const userId = decodedToken(token);
    // console.log("Recuperer token: " + token);
    console.log("TOKEN ID: " + userId );
    console.log("Product //", name, manufacturer, description, mainPepper, heat,image);

    // Vérification des champs obligatoires
    if (!name || !manufacturer || !description || !mainPepper || !heat) {
      return res.status(400).json({error:'Veuillez fournir tous les champs obligatoires.'});
    }

  
    // Création d'une nouvelle instance de Sauce avec les données fournies
    const newSauce = new Sauce({
      userId: userId, // Remplacer par l'ID de l'utilisateur réel
      name: name,
      manufacturer: manufacturer,
      description: description,
      mainPepper: mainPepper,
      heat: heat,
      imageUrl: `assets/images/${imageUrl}`, // Chemin de l'image téléchargée
      likes: 0,
      dislikes: 0,
      usersLiked: [""],
      usersDisliked: [""]
    });
    console.log("REQ ::",req);
    
  
    // Enregistrement de la nouvelle sauce dans la base de données
    newSauce.save()
      .then((savedSauce) => {
        res.send(JSON.parse(savedSauce));
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Erreur lors de l\'enregistrement de la sauce');
      });
}

// function Method PUT
function updateSauce(req,res) {
    
}
// function Method delete
function deleteSauce(req,res) {}

function likeSauces(req,res) {}

module.exports = {
    sauces,saucesById,addSauces,updateSauce,deleteSauce,likeSauces
}