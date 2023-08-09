const configs = require('../configs/connectDatabase')
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
require('dotenv').config();

/// --------------  A REVOIR  --------------
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String
});

// Ajout d'une méthode pour hacher le mot de passe avant de sauvegarder l'utilisateur
userSchema.pre('save', function (next) {
  const user = this;
 
  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }

    user.password = hash;
    next();
  });
});
// Création du modèle utilisateur à partir du schéma
const User = mongoose.model('User', userSchema);

async function signup(req, res) {
  const connectToDatabase = configs.connectToDatabase();
  
  connectToDatabase.then(async () => {
    const { email, password } = req.body;

     // Validation du schéma avec Joi
    

  


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({message:'Adresse e-mail déjà utilisée.'});
    //   new Error('Email déja utilisé')
    }

    const newUser = new User({ email, password });
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
    const User = mongoose.model('User', userSchema);
  
    try {
      // Recherche de l'utilisateur par adresse e-mail
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({message:'Adresse e-mail ou mot de passe invalide.'});
      }
  
      if (!password) {
        return res.status(401).json({message:'Mot de passe requis.'});
      }
  
      if (!email) {
        return res.status(401).json({message:'Email requis.'});
      }
  
      // Comparaison du mot de passe fourni avec le mot de passe haché stocké dans la base de données
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({message:'Adresse e-mail ou mot de passe invalide.'});
      }
  
      // Génération du jeton JWT avec l'ID de l'utilisateur comme payload
      const token = jwt.sign({ userId: user._id }, process.env.TOKEN_USER, { expiresIn: '4h' });
    
 
  
      // Connexion réussie
      res.status(200).json({ userId: user._id, token });
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur serveur.');
    }
}
  


module.exports ={
    login,signup
}