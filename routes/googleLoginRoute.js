// const firebase = require("firebase-admin");
// const serviceAccount = {
//     "type": "service_account",
//         "project_id": "ian-14014",
//         "private_key_id": process.env.FIRE_SERVICE_PRIVATE_KEY_ID,
//         "private_key": process.env.FIRE_SERVICE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//         "client_email": process.env.CLIENT_EMAIL ,
//         "client_id": process.env.CLIENT_ID,
//         "auth_uri": process.env.AUTH_URI,
//         "token_uri": process.env.TOKEN_URI,
//         "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
//         "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL,
//         "universe_domain": "googleapis.com"
// };

// firebase.initializeApp({
//   credential: firebase.credential.cert(serviceAccount),
// });


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