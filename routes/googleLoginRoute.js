const firebase = require("../config/initFireBase.js");

const googleLoginRoute = require("express").Router();

googleLoginRoute.post("/", async (req, res) => {

  const idToken = req.body.token;

  try {
      const decodedToken = await firebase.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const userRecord = await firebase.auth().getUser(uid);
      const email = userRecord.email;
      res.json({ message: 'Successfully authenticated', email});


  } catch (error) {
      console.error('Error verifying token:', error);
      res.status(401).json({ error: 'Unauthorized' });
  }
});

module.exports = googleLoginRoute;