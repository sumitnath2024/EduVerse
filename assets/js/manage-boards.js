document.addEventListener('DOMContentLoaded', function () {
  const db = firebase.database();

  // Function to add a new board
  document.getElementById('boardForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const boardName = document.getElementById('boardName').value;
    const boardDescription = document.getElementById('boardDescription').value;

    db.ref('EduVerse/' + boardName).set({
      description: boardDescription
    }).then(() => {
      alert('Board added successfully!');
      document.getElementById('boardForm').reset();
      loadBoards();
    }).catch((error) => {
      console.error('Error adding board:', error);
      alert('Error adding board');
    });
  });

  // Function to load all boards and display them in the table
  function loadBoards() {
    db.ref('EduVerse').once('value', function (snapshot) {
      const boardsTableBody = document.getElementById('boardsTable').getElementsByTagName('tbody')[0];
      boardsTableBody.innerHTML = ''; // Clear the table body

      snapshot.forEach(function (childSnapshot) {
        const board = childSnapshot.val();
        const boardId = childSnapshot.key;

        const row = boardsTableBody.insertRow();
        row.innerHTML = `
          <td>${boardId}</td>
          <td>${board.description}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editBoard('${boardId}', '${board.description}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteBoard('${boardId}')">Delete</button>
          </td>
        `;
      });
    });
  }

  // Function to edit a board
  window.editBoard = function (boardId, currentDescription) {
    const newName = prompt('Enter new name:', boardId);
    const newDescription = prompt('Enter new description:', currentDescription);

    if (newName && newDescription) {
      db.ref('EduVerse/' + boardId).remove().then(() => {
        db.ref('EduVerse/' + newName).set({
          description: newDescription
        }).then(() => {
          alert('Board updated successfully!');
          loadBoards();
        }).catch((error) => {
          console.error('Error updating board:', error);
          alert('Error updating board');
        });
      }).catch((error) => {
        console.error('Error removing old board:', error);
        alert('Error removing old board');
      });
    }
  };

  // Function to delete a board
  window.deleteBoard = function (boardId) {
    if (confirm('Are you sure you want to delete this board?')) {
      db.ref('EduVerse/' + boardId).remove()
        .then(() => {
          alert('Board deleted successfully!');
          loadBoards();
        })
        .catch((error) => {
          console.error('Error deleting board:', error);
          alert('Error deleting board');
        });
    }
  };

  // Load boards on page load
  loadBoards();
});
