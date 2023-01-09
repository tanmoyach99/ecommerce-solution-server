var admin = require("firebase-admin");
// const { initializeApp } = require("firebase-admin/app");

var serviceAccount = require("../config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ecommerce-solution-ccb9e.firebaseio.com",
});

// initializeApp({
//   credential: applicationDefault(),
//   databaseURL: "https://ecommerce-solution-ccb9e.firebaseio.com",
// });

module.exports = admin;
