const admin = require('firebase-admin');

admin.initializeApp();

const main = admin.firestore();

module.exports = { admin, main };

