// Function to check password strength
function checkPasswordStrength() {
    var password = document.getElementById('passwordField').value;
        var strengthText = document.getElementById('passwordStrength');
        if (password.length < 8 || !password.match(/[a-z]/i) || !password.match(/[0-9]/) || !password.match(/[^a-zA-Z0-9]/)) {
            strengthText.textContent = 'Password is too weak';
            strengthText.style.color = 'red';
            return false;
        } else {
            strengthText.textContent = 'Password is strong';
            strengthText.style.color = 'green';
            return true;
        }

}

// Function to register user
function registerUser(event) {
    event.preventDefault();
    var name = document.getElementById('nameField').value;
    var email = document.getElementById('emailField').value;
    var password = document.getElementById('passwordField').value;
    if (!checkPasswordStrength()) {
        alert('Your password does not meet the strength requirements.');
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user;
            firebase.database().ref('users/' + user.uid).set({
                name: name,
                email: email,
                role: 'user'
            })
            .then(() => {
                alert('User registered successfully!');
                window.location.href = 'login.html'; // Redirect to login page
            })
            .catch((error) => {
                console.error('Error registering user: ', error);
                alert('Error: ' + error.message);
            });
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert('Error: ' + errorMessage);
        });
}
