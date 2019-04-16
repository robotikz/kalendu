const functions = require('firebase-functions');
const app = require('./app.js');

exports.app = functions.https.onRequest(app);