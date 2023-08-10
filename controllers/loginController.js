const configs = require('../configs/connectDatabase')
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userSchema = require('../models/Users')

async function signup(req, res) {
  const connectToDatabase = configs.connectToDatabase();
  
  connectToDatabase.then(async () => {
    const { email, password } = req.body;

    const existingUser = await userSchema.findOne({ email });
    if (existingUser) {
      return res.status(409).json({messages:'Adresse e-mail déjà utilisée.'});
    }

    const newUser = new userSchema({ email, password });

    try {
      await newUser.save();
      return res.status(201).json({message:'Utilisateur enregistré avec succès.'});
    } catch (err) {
      console.error(err);
      return res.status(500).send('Erreur serveur.');
    }
  });
}
 
async function login(req, res) {
  const { password, email } = req.body;  
  try {
    // Recherche de l'utilisateur par adresse e-mail
    const user = await userSchema.findOne({email:email });
 
    // Comparaison du mot de passe fourni avec le mot de passe haché stocké dans la base de données
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (user === null || !passwordMatch) {
       res.status(401).json({message:'Adresse e-mail ou mot de passe invalide.'});
       return
    }

    // Génération du jeton JWT avec l'ID de l'utilisateur comme payload
    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_USER, { expiresIn: '4h' });

    // Connexion réussie
    res.status(200).json({ userId: user._id, token });

  } catch (error) {
    console.log("ERROR //",error);
    res.status(500).json({ message: "Une erreur est survenue lors de la connexion." });
  }
}

module.exports ={
    login,signup
}