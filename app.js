// Dépendances
const express = require("express");
const winston = require("winston");
const morgan = require("morgan");
const expressListEndpoints = require("express-list-endpoints");
require('dotenv').config()

const app = express();
const port = 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',"http://localhost:4200"); // Remplacez cette URL par l'URL de votre application frontend
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
// Inclure les routes
const routes = require("./routes/routing");
// Configuration de notre conenxion a la
const config = require('./configs/connectDatabase');

// Middleware pour enregistrer les requêtes HTTP
app.use(morgan("tiny", { stream: winston.stream.write }));

// Données au format JSON
app.use(express.json());

// Utilisation de nos routes en ajoutant "api" pour chaque routes
app.use("/api",routes);

// Affiche les routes disponibles
const printAllRoutes = expressListEndpoints(app);

console.log("--- Routes disponibles ---");
printAllRoutes.forEach((route) => {
  console.log(`${route.methods.join(", ")} ${route.path}`);
});
console.log("--- --- --- --- --- --- ---");
// On lance notre serveur sur le port 3000
app.listen(port, () => {
  console.log(`Serveur lancer: http://localhost:${port}/`);
});
config.connectToDatabase();