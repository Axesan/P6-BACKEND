const multer = require('multer');
// Définition du type de fichiers
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
};
// Destination du fichier 
const storage = multer.diskStorage({
  // Indique le dossier ou seront enregistrer les images donc dans 'images'
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // Définit le nom du fichiers 
  filename: (req, file, callback) => {
    const extension = MIME_TYPES[file.mimetype] || "jpg"; // Test les argument, si renvoie null ou undeffined --> jpg 
    callback(null,Date.now() + '.' + extension); // Définit le nom du fichier final
  }
});

module.exports = multer({storage: storage}).single('image');