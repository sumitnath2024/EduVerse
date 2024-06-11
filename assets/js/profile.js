document.addEventListener('DOMContentLoaded', function () {
  const db = firebase.database();
  const user = firebase.auth().currentUser;

  // Function to load board names into the select dropdown
  function loadBoards() {
    const boardSelect = document.getElementById('board');
    db.ref('EduVerse').once('value', function (snapshot) {
      boardSelect.innerHTML = '<option value="" selected disabled>Select Board</option>';
      snapshot.forEach(function (childSnapshot) {
        const board = childSnapshot.key;
        const option = document.createElement('option');
        option.value = board;
        option.textContent = board;
        boardSelect.appendChild(option);
      });
    });
  }

  // Load boards on page load
  loadBoards();

  // Event listener for board selection to load classes
  document.getElementById('board').addEventListener('change', function () {
    loadClasses(this.value);
  });

  // Function to load class names based on selected board
  function loadClasses(boardId) {
    const classSelect = document.getElementById('class');
    db.ref(`EduVerse/${boardId}`).once('value', function (snapshot) {
      classSelect.innerHTML = '<option value="" selected disabled>Select Class</option>';
      snapshot.forEach(function (childSnapshot) {
        if (childSnapshot.key !== 'description') {
          const className = childSnapshot.key;
          const option = document.createElement('option');
          option.value = className;
          option.textContent = className;
          classSelect.appendChild(option);
        }
      });
    });
  }

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const email = user.email;
      const userRef = db.ref('users').orderByChild('email').equalTo(email);

      userRef.once('value').then((snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach(function (childSnapshot) {
            const userData = childSnapshot.val();
            document.getElementById('name').value = userData.name || '';
            document.getElementById('address').value = userData.address || '';
            document.getElementById('phone').value = userData.phone || '';
            document.getElementById('guardianName').value = userData.guardianName || '';
            document.getElementById('guardianPhone').value = userData.guardianPhone || '';
            document.getElementById('dob').value = userData.dob || '';
            document.getElementById('board').value = userData.board || '';
            document.getElementById('school').value = userData.school || '';
            document.getElementById('class').value = userData.class || '';
            document.getElementById('email').value = userData.email || '';
            document.getElementById('hobbies').value = userData.hobbies || '';

            if (userData.board) {
              loadClasses(userData.board);
            }
          });
        }
      }).catch((error) => {
        console.error('Error loading user data:', error);
      });
    } else {
      console.error('No user is signed in');
    }
  });

  document.getElementById('profileForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const user = firebase.auth().currentUser;

    if (user) {
      const email = user.email;
      const userRef = db.ref('users').orderByChild('email').equalTo(email);

      userRef.once('value').then((snapshot) => {
        snapshot.forEach(function (childSnapshot) {
          const userId = childSnapshot.key;

          const updatedData = {
            name: document.getElementById('name').value,
            address: document.getElementById('address').value,
            phone: document.getElementById('phone').value,
            guardianName: document.getElementById('guardianName').value,
            guardianPhone: document.getElementById('guardianPhone').value,
            dob: document.getElementById('dob').value,
            board: document.getElementById('board').value,
            school: document.getElementById('school').value,
            class: document.getElementById('class').value,
            email: document.getElementById('email').value,
            hobbies: document.getElementById('hobbies').value,
            profileComplete: true
          };

          db.ref('users/' + userId).update(updatedData).then(() => {
            alert('Profile updated successfully');
            window.location.href = 'user-dashboard.html'; // Redirect to user dashboard
          }).catch((error) => {
            console.error('Error updating profile:', error);
            alert('Error updating profile: ' + error.message);
          });
        });
      }).catch((error) => {
        console.error('Error updating profile data:', error);
      });
    } else {
      console.error('No user is signed in');
      alert('You need to be signed in to update your profile.');
    }
  });
});
