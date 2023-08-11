const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
// URL de connexion à la base de données MongoDB --> fichier .env
const databaseURL = process.env.DATABASE_URL_MONGO;



// Options de configuration de Mongoose à revoir
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true, 
  };
  
  // A mettre dans un fichier config
 async function connectToDatabase() {
    try {
      mongoose.connect(databaseURL, mongooseOptions);
      console.log("Connexion à la base de données établie avec succès!");
     
    } catch (error) { 
      console.error("Erreur de connexion à la base de données:", error.message);
    }
  }

module.exports ={
    connectToDatabase
}