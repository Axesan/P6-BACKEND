const configs = require('../configs/connectDatabase')
const mongoose = require('mongoose');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const verifToken = require('../configs/verifToken');
const Sauce = require('../models/Product')



function decodedToken(tokenUserId){
  const secretKey = process.env.TOKEN_USER; // Assurez-vous d'utiliser la même clé secrète utilisée pour signer le tokenUserId
  const decodedToken = jwt.verify(tokenUserId, secretKey);
  const userId = decodedToken.userId;
  console.log('ID de l\'utilisateur :', userId);
  return userId;
}

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

// Function method Post
async function addSauces(req, res) {
    // Récupérer les données de la sauce depuis le corps de la requête
    const sauceData = req.body.sauce;
    console.log("SAUCEDATA::",req);
    // ID de l'utilisateur
    const token = req.headers.authorization.split(' ')[1]; 
    const decodedToken = jwt.verify(token, process.env.TOKEN_USER);
    const userId = decodedToken.userId;
    console.log(decodedToken);
    // Créer une nouvelle instance de Sauce en utilisant le modèle Mongoose
    const newSauce = new Sauce({
      userId: userId,
      name: sauceData.name,
      manufacturer: sauceData.manufacturer,
      description: sauceData.description,
      mainPepper: sauceData.mainPepper,
      imageUrl: sauceData.imageUrl,
      heat: sauceData.heat,
      likes: 0, // Nouvelle sauce, donc initialiser les likes à 0
      dislikes: 0, // Nouvelle sauce, donc initialiser les dislikes à 0
      usersLiked: [""], // Nouvelle sauce, donc initialiser les usersLiked à un tableau vide
      usersDisliked: [""] // Nouvelle sauce, donc initialiser les usersDisliked à un tableau vide
    });
  
    // Enregistrer la nouvelle sauce dans la base de données
   await newSauce.save()
      .then((savedSauce) => {
        // Renvoyer une réponse réussie avec un statut 201 et un message
        return res.status(201).json({ message: "Sauce added successfully", sauce: savedSauce });
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
      });
}



// function Method PUT
function updateSauce(req,res) {
    
}
// function Method delete
function deleteSauce(req,res) {

    const sauceId = req.params.id;
  
    // Use the Sauce model to find the sauce by its id and delete it
    Sauce.findByIdAndRemove(sauceId)
      .then((deletedSauce) => {
        if (!deletedSauce) {
          // If the sauce with the given id was not found
          return res.status(404).json({ error: "Sauce not found" });
        }
        // If the sauce was deleted successfully
        return res.status(200).json({ message: "Sauce deleted successfully" });
      })
      .catch((error) => {
        // If there was an error during the deletion process
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
      });
  }
  
  
  


async function likeSauces(req,res) {
  try {
    const sauceId = req.params.id;

    // ID de l'utilisateur
    const token = req.headers.authorization.split(' ')[1]; 
    const decodedToken = jwt.verify(token, process.env.TOKEN_USER);
    const userId = decodedToken.userId; // Remplacez '12345' par l'ID de l'utilisateur qui like la sauce (vous devrez récupérer l'ID de l'utilisateur à partir de l'authentification)

    // Recherche de la sauce dans la base de données
    const sauce = await Sauce.findById(sauceId);

    if (!sauce) {
      return res.status(404).json({ message: 'Sauce not found' });
    }

    // Vérification si l'utilisateur a déjà liké ou disliké la sauce
    const alreadyLiked = sauce.usersLiked.includes(userId);
    const alreadyDisliked = sauce.usersDisliked.includes(userId);

    // Traitement du like/dislike en fonction de la valeur de req.body.like
    if (req.body.like === 1) {
      if (alreadyLiked) {
        // Si l'utilisateur a déjà liké la sauce, il souhaite retirer son like
        sauce.likes -= 1;
        sauce.usersLiked = sauce.usersLiked.filter(id => id !== userId);
      } else {
        // Sinon, il ajoute son like
        sauce.likes += 1;
        sauce.usersLiked.push(userId);
      }
    } else if (req.body.like === -1) {
      if (alreadyDisliked) {
        // Si l'utilisateur a déjà disliké la sauce, il souhaite retirer son dislike
        sauce.dislikes -= 1;
        sauce.usersDisliked = sauce.usersDisliked.filter(id => id !== userId);
      } else {
        // Sinon, il ajoute son dislike
        sauce.dislikes += 1;
        sauce.usersDisliked.push(userId);
      }
    } else if (req.body.like === 0) {
      // Si req.body.like vaut 0, cela signifie que l'utilisateur souhaite retirer son like ou son dislike
      if (alreadyLiked) {
        sauce.likes -= 1;
        sauce.usersLiked = sauce.usersLiked.filter(id => id !== userId);
      } else if (alreadyDisliked) {
        sauce.dislikes -= 1;
        sauce.usersDisliked = sauce.usersDisliked.filter(id => id !== userId);
      }
    }
    // Sauvegarde des modifications dans la base de données
    await sauce.save();

    return res.status(200).json({ message: 'Action performed successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
    sauces,saucesById,addSauces,updateSauce,deleteSauce,likeSauces
}