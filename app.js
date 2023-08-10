// Dépendances
const express = require("express");
const winston = require("winston");
const morgan = require("morgan");
const bodyParser = require('body-parser');
const expressListEndpoints = require("express-list-endpoints");
require('dotenv').config()


const app = express();
const port = 3000;

// Inclure les routes
const routes = require("./routes/routing");
// Configuration de notre connexion à la base de données
const config = require('./configs/connectDatabase');

// Middleware pour enregistrer les requêtes HTTP
app.use(morgan("tiny", { stream: winston.stream.write }));


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "http://localhost:4200"); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


// Affiche nos images 
app.use('/images', express.static('images'));

// Données au format JSON
app.use(express.json());

// Utilisation de nos routes en ajoutant "api" pour chaque route
app.use("/api", routes);

// Affiche les routes disponibles
const printAllRoutes = expressListEndpoints(app);

console.log("--- Routes disponibles ---");
printAllRoutes.forEach((route) => {
  console.log(`${route.methods.join(", ")} ${route.path}`);
});
console.log("--- --- --- --- --- --- ---");

// On lance notre serveur sur le port 3000
app.listen(port, () => {
  console.log(`Serveur lancé: http://localhost:${port}/`);
});
config.connectToDatabase();
