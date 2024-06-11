// assets/js/register.js

// Password strength checker
function checkPasswordStrength(password) {
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.match(/[a-z]+/)) strength++;
  if (password.match(/[A-Z]+/)) strength++;
  if (password.match(/[0-9]+/)) strength++;
  if (password.match(/[$@#&!]+/)) strength++;
  return strength;
}

document.getElementById('password').addEventListener('input', function () {
  const password = document.getElementById('password').value;
  const strength = checkPasswordStrength(password);
  const strengthText = ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'];
  const strengthColors = ['#dc3545', '#dc3545', '#ffc107', '#28a745', '#28a745'];
  
  document.getElementById('password-strength').textContent = `Password Strength: ${strengthText[strength]}`;
  document.getElementById('password-strength').style.color = strengthColors[strength];
});

document.getElementById('registerForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementsByName('username')[0].value;
  const email = document.getElementsByName('email')[0].value;
  const password = document.getElementsByName('password')[0].value;

  // Get the next available user ID
  firebase.database().ref('users').orderByKey().limitToLast(1).once('value', function (snapshot) {
    let nextUserId = 1;
    snapshot.forEach(function (childSnapshot) {
      const lastUserId = childSnapshot.key;
      nextUserId = parseInt(lastUserId) + 1;
    });

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        firebase.database().ref('users/' + nextUserId).set({
          username: username,
          email: email,
          role: 'client',
          profileComplete: false // Profile completion status
        }).then(() => {
          alert('User registered successfully! Please complete your profile.');
          window.location.href = 'profile.html';
        }).catch((error) => {
          console.error('Error writing user information to database', error);
          alert('Error writing user information to database');
        });
      })
      .catch((error) => {
        console.error('Error during user registration', error);
        alert('Error: ' + error.message);
      });
  });
});
