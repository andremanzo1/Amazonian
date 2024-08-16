//googleLoginButton.js
// Import Firebase modules
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js';
  import { getAuth, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js';
  //recieve firebase api from backend, index.js file 
  async function receiveFirebaseApi() {
    let url = "/firebaseAPI"
    let response = await fetch(url);
    let data = await response.json();
    return data;
  }
document.getElementById('google-btn-container').addEventListener('click', async () => {
        const firebaseCredentials = await receiveFirebaseApi();
  // Your Firebase config
  const firebaseConfig = {
    apiKey: firebaseCredentials.key,
         authDomain: firebaseCredentials.authDomain,
         projectId: firebaseCredentials.projectId,
         storageBucket: firebaseCredentials.storageBucket,
         messagingSenderId: firebaseCredentials.messagingSenderId,
         appId: firebaseCredentials.appId,
         measurementId: firebaseCredentials.measurementId
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
          const provider = new GoogleAuthProvider();
          signInWithPopup(auth, provider)
              .then((result) => {
                  const token = result._tokenResponse.idToken; // Use this token
                  fetch('/googleLogin', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ token }),
                  })
                  .then(response => response.json())
                  .then(data => {
                      if (data.message === 'Successfully authenticated') {
                          // Redirect on the client side
                          window.location.href = `/GHome?email=${encodeURIComponent(data.email)}`;
                      } else {
                          console.error('Authentication failed:', data.error);
                      }
                  })
                  .catch((error) => {
                      console.error('Error:', error);
                  });
              })
              .catch((error) => {
                  console.error('Error during sign in:', error);
              });
      });
