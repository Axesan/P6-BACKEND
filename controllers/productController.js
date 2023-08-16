const jwt = require('jsonwebtoken');
const Sauce = require('../models/Product')
const fs = require('fs');


// Function methode get
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


// Fonction pour vérifier une chaîne de caractères sans entiers
function isStringWithNoNumbers(inputString) {
  return /^[^\d.]+$/.test(inputString);
}
// ...


  // Function method Post

async function addSauces(req, res) {
  // Récupérer les données de la sauce depuis le corps de la requête
  const sauceData = JSON.parse(req.body.sauce);
  // ID de l'utilisateur
  const token = req.headers.authorization.split(' ')[1]; 
  const decodedToken = jwt.verify(token, process.env.TOKEN_USER);
  const userId = decodedToken.userId;

  // Vérification des champs sans entier
  if (
      !isStringWithNoNumbers(sauceData.name) ||
      !isStringWithNoNumbers(sauceData.manufacturer) ||
      !isStringWithNoNumbers(sauceData.description) ||
      !isStringWithNoNumbers(sauceData.mainPepper)
  ) {
      // Supprimer le fichier image en cas d'erreur de validation génerer
      fs.unlinkSync(`images/${req.file.filename}`);
      return res.status(400).json({ message: 'Veuillez entrer une chaîne de caractères' });
  }

  // Créer une nouvelle instance de Sauce en utilisant le modèle Mongoose
  const newSauce = new Sauce({
      userId: userId,
      name: sauceData.name,
      manufacturer: sauceData.manufacturer,
      description: sauceData.description,
      mainPepper: sauceData.mainPepper,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      heat: sauceData.heat,
      likes: 0, // Nouvelle sauce, donc initialiser les likes à 0
      dislikes: 0, // Nouvelle sauce, donc initialiser les dislikes à 0
      usersLiked: [], // Nouvelle sauce, donc initialiser les usersLiked à un tableau vide
      usersDisliked: [] // Nouvelle sauce, donc initialiser les usersDisliked à un tableau vide
  });

  // Enregistrer la nouvelle sauce dans la base de données
  await newSauce
      .save()
      .then((savedSauce) => {
          // Renvoyer une réponse réussie avec un statut 201 et un message
          return res
              .status(201)
              .json({ message: 'Sauce added successfully', sauce: savedSauce });
      })
      .catch((error) => {
          console.error(error);
          return res.status(500).json({ error: 'Internal server error' });
      });
}


// Function Method PUT
async function updateSauce(req, res) {
  try {
    // Si on modifie le fichier image, récupérer le nom du fichier image sauce actuelle et suppression
    // pour éviter d'avoir un fichier inutile dans le dossier images
    if (req.file) {
      const sauce = await Sauce.findOne({ _id: req.params.id });

      if (sauce) {
        const filename = sauce.imageUrl.split("/images")[1];
        // Suppression de l'image de la sauce car elle va être remplacée par la nouvelle image de sauce
        // unlink du package fs qui supprime notre fichier 
        fs.unlink(`images/${filename}`, (err) => {
          if (err) throw err;
        });
      }
    }
       // Vérification des champs sans entier - MAJ - Soutenance 
       if (
        (req.body.name && !isStringWithNoNumbers(req.body.name)) ||
        (req.body.manufacturer && !isStringWithNoNumbers(req.body.manufacturer)) ||
        (req.body.description && !isStringWithNoNumbers(req.body.description)) ||
        (req.body.mainPepper && !isStringWithNoNumbers(req.body.mainPepper))
      ) {
        //fs.unlinkSync(`images/${req.file.filename}`);
        return res.status(400).json({ message: 'Veuillez entrez une chaine de caractére' });
      }

    // L'objet qui va être envoyé dans la base de données
    let sauceObject;
    // Vérification de req.file (Si l'image est modifier)
    if (req.file) {
      sauceObject = {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      };
    } else {
      sauceObject = { ...req.body };
    }
    // La mise a jour.
    await Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id });

    res.status(200).json({ message: "Sauce modifiée" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Function Method delete
function deleteSauce(req, res) {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        // If the sauce with the given id was not found
        return res.status(404).json({ error: "Sauce not found" });
      }

      const filename = sauce.imageUrl.split("/images/")[1]; // On récupère avec la méthode split le nom ficher image dans l'URL

      fs.unlink(`images/${filename}`, (error) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: "Failed to delete image" });
        }

        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
}

// Function like and dislike. 
async function likeSauces(req,res) {
  try {
    const sauceId = req.params.id;

    // ID de l'utilisateur
    const token = req.headers.authorization.split(' ')[1]; 
    const decodedToken = jwt.verify(token, process.env.TOKEN_USER);
    const userId = decodedToken.userId;

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

    return res.status(200).json({ message: 'Like OKEY !' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
    sauces,saucesById,addSauces,updateSauce,deleteSauce,likeSauces
}