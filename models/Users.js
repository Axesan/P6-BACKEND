const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const MongooseErrors = require('mongoose-errors');


const utilisateurSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

utilisateurSchema.plugin(uniqueValidator);
utilisateurSchema.plugin(MongooseErrors);

module.exports = mongoose.model('Utilisateur', utilisateurSchema);