document.addEventListener('DOMContentLoaded', function () {
  const db = firebase.database();
  const usersTable = document.getElementById('usersTable').getElementsByTagName('tbody')[0];

  // Function to load users
  function loadUsers() {
    db.ref('users').once('value', function (snapshot) {
      usersTable.innerHTML = '';
      snapshot.forEach(function (childSnapshot) {
        const userData = childSnapshot.val();
        const row = usersTable.insertRow();
        
        row.insertCell(0).innerText = userData.username;
        row.insertCell(1).innerText = userData.email;

        const userTypeCell = row.insertCell(2);
        const userTypeSelect = document.createElement('select');
        userTypeSelect.classList.add('form-control');
        userTypeSelect.innerHTML = `
          <option value="admin" ${userData.role === 'admin' ? 'selected' : ''}>Admin</option>
          <option value="client" ${userData.role === 'client' ? 'selected' : ''}>Client</option>
        `;
        userTypeSelect.addEventListener('change', function () {
          updateUserRole(childSnapshot.key, this.value);
        });
        userTypeCell.appendChild(userTypeSelect);

        const actionsCell = row.insertCell(3);
        const viewButton = document.createElement('button');
        viewButton.classList.add('btn', 'btn-info', 'btn-sm', 'me-2');
        viewButton.innerText = 'View';
        viewButton.addEventListener('click', function () {
          viewUserProfile(childSnapshot.key);
        });
        actionsCell.appendChild(viewButton);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
        deleteButton.innerText = 'Delete';
        deleteButton.addEventListener('click', function () {
          deleteUser(childSnapshot.key);
        });
        actionsCell.appendChild(deleteButton);
      });
    });
  }

  // Function to update user role
  function updateUserRole(userId, newRole) {
    db.ref('users/' + userId).update({ role: newRole }).then(() => {
      alert('User role updated successfully.');
    }).catch((error) => {
      console.error('Error updating user role:', error);
      alert('Error updating user role: ' + error.message);
    });
  }

  // Function to delete user
  function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
      db.ref('users/' + userId).remove().then(() => {
        alert('User deleted successfully.');
        loadUsers(); // Reload users after deletion
      }).catch((error) => {
        console.error('Error deleting user:', error);
        alert('Error deleting user: ' + error.message);
      });
    }
  }

  // Function to view user profile
  function viewUserProfile(userId) {
    db.ref('users/' + userId).once('value', function (snapshot) {
      const userData = snapshot.val();
      document.getElementById('profileName').innerText = userData.username;
      document.getElementById('profileEmail').innerText = userData.email;
      document.getElementById('profilePhone').innerText = userData.phone;
      document.getElementById('profileBoard').innerText = userData.board;
      document.getElementById('profileClass').innerText = userData.class;
      document.getElementById('profileSchool').innerText = userData.school;
      document.getElementById('profileGuardianName').innerText = userData.guardianName;
      document.getElementById('profileGuardianPhone').innerText = userData.guardianPhone;
      document.getElementById('profileHobbies').innerText = userData.hobbies;

      const userProfileModal = new bootstrap.Modal(document.getElementById('userProfileModal'), {
        keyboard: false
      });
      userProfileModal.show();
    });
  }

  // Function to download user data as Excel
  function downloadExcel() {
    db.ref('users').once('value', function (snapshot) {
      const users = [];
      snapshot.forEach(function (childSnapshot) {
        const userData = childSnapshot.val();
        users.push(userData);
      });

      const worksheet = XLSX.utils.json_to_sheet(users);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

      XLSX.writeFile(workbook, 'users.xlsx');
    });
  }

  document.getElementById('downloadExcel').addEventListener('click', downloadExcel);

  // Load users on page load
  loadUsers();
});
