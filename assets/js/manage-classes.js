document.addEventListener('DOMContentLoaded', function () {
  const db = firebase.database();

  // Function to load board names into the select dropdown
  function loadBoards() {
    const boardSelect = document.getElementById('boardName');
    db.ref('EduVerse').once('value', function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        const board = childSnapshot.key;
        const option = document.createElement('option');
        option.value = board;
        option.textContent = board;
        boardSelect.appendChild(option);
      });
    });
  }

  // Function to add a new class
  document.getElementById('classForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const boardName = document.getElementById('boardName').value;
    const className = document.getElementById('className').value;

    if (boardName && className) {
      db.ref(`EduVerse/${boardName}/${className}`).set({
        name: className
      }).then(() => {
        alert('Class added successfully!');
        document.getElementById('classForm').reset();
        loadClasses();
      }).catch((error) => {
        console.error('Error adding class:', error);
        alert('Error adding class');
      });
    } else {
      alert('Please select a board and enter a class name.');
    }
  });

  // Function to load all classes and display them in the table
  function loadClasses() {
    const classesTableBody = document.getElementById('classesTable').getElementsByTagName('tbody')[0];
    classesTableBody.innerHTML = ''; // Clear the table body

    db.ref('EduVerse').once('value', function (snapshot) {
      snapshot.forEach(function (boardSnapshot) {
        const boardId = boardSnapshot.key;
        const boardData = boardSnapshot.val();

        Object.entries(boardData).forEach(([classId, classData]) => {
          if (classId !== 'description') { // Ensure not to consider 'description' as a class
            const row = classesTableBody.insertRow();
            row.innerHTML = `
              <td>${boardId}</td>
              <td>${classId}</td>
              <td>
                <button class="btn btn-warning btn-sm" onclick="editClass('${boardId}', '${classId}', '${classId}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteClass('${boardId}', '${classId}')">Delete</button>
              </td>
            `;
          }
        });
      });
    });
  }

  // Function to edit a class
  window.editClass = function (boardId, classId, currentName) {
    const newName = prompt('Enter new class name:', currentName);

    if (newName) {
      const updates = {};
      updates[`EduVerse/${boardId}/${classId}`] = null; // Remove old class
      updates[`EduVerse/${boardId}/${newName}`] = { name: newName }; // Add new class

      db.ref().update(updates).then(() => {
        alert('Class updated successfully!');
        loadClasses();
      }).catch((error) => {
        console.error('Error updating class:', error);
        alert('Error updating class');
      });
    }
  };

  // Function to delete a class
  window.deleteClass = function (boardId, classId) {
    if (confirm('Are you sure you want to delete this class?')) {
      db.ref(`EduVerse/${boardId}/${classId}`).remove()
        .then(() => {
          alert('Class deleted successfully!');
          loadClasses();
        })
        .catch((error) => {
          console.error('Error deleting class:', error);
          alert('Error deleting class');
        });
    }
  };

  // Load boards and classes on page load
  loadBoards();
  loadClasses();
});
