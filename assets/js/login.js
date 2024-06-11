document.addEventListener('DOMContentLoaded', function () {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const email = user.email;

      // Check if the profile is complete and the user's role
      firebase.database().ref('users').orderByChild('email').equalTo(email).once('value', function (snapshot) {
        if (snapshot.exists()) {
          let userData;
          snapshot.forEach(function (childSnapshot) {
            userData = childSnapshot.val();
          });

          if (userData.profileComplete) {
            if (userData.role === 'admin') {
              handleLogin('admin', userData.username, 'manage-boards.html'); // Load admin dashboard
            } else {
              handleLogin('client', userData.username, 'book-store.html'); // Load user dashboard
            }
          } else {
            alert('Please complete your profile.');
            handleLogin('client', userData.username, 'profile.html'); // Load profile page
          }
        } else {
          alert('User data not found. Please contact support.');
        }
      });
    }
  });

  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Check if the profile is complete and the user's role
        firebase.database().ref('users').orderByChild('email').equalTo(email).once('value', function (snapshot) {
          if (snapshot.exists()) {
            let userData;
            snapshot.forEach(function (childSnapshot) {
              userData = childSnapshot.val();
            });

            if (userData.profileComplete) {
              if (userData.role === 'admin') {
                handleLogin('admin', userData.username, 'manage-boards.html'); // Load admin dashboard
              } else {
                handleLogin('client', userData.username, 'book-store.html'); // Load user dashboard
              }
            } else {
              alert('Please complete your profile.');
              handleLogin('client', userData.username, 'profile.html'); // Load profile page
            }
          } else {
            alert('User data not found. Please contact support.');
          }
        });
      })
      .catch((error) => {
        console.error('Error during login', error);
        alert('Error: ' + error.message);
      });
  });
});

function handleLogin(userType, username, page) {
  // Post a message to the parent window
  window.parent.postMessage({ userType, username, page }, '*');
}
