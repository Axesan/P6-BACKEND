const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const MongooseErrors = require('mongoose-errors');
const bcrypt = require('bcrypt');

const utilisateurSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

utilisateurSchema.plugin(uniqueValidator);
utilisateurSchema.plugin(MongooseErrors);

// Ajout d'une méthode pour hacher le mot de passe avant de sauvegarder l'utilisateur
utilisateurSchema.pre('save', function (next) {
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
module.exports = mongoose.model('User', utilisateurSchema);