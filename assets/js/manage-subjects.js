document.addEventListener('DOMContentLoaded', function () {
  const db = firebase.database();

  function loadBoards() {
    const boardSelect = document.getElementById('boardSelect');
    db.ref('EduVerse').once('value', (snapshot) => {
      boardSelect.innerHTML = '<option value="">Select Board</option>';
      snapshot.forEach((childSnapshot) => {
        const board = childSnapshot.key;
        const option = document.createElement('option');
        option.value = board;
        option.textContent = board;
        boardSelect.appendChild(option);
      });
    });
  }

  document.getElementById('boardSelect').addEventListener('change', function () {
    loadClasses(this.value);
  });

  function loadClasses(boardId) {
    const classSelect = document.getElementById('classSelect');
    db.ref(`EduVerse/${boardId}`).once('value', (snapshot) => {
      classSelect.innerHTML = '<option value="">Select Class</option>';
      snapshot.forEach((childSnapshot) => {
        const className = childSnapshot.key;
        if (className !== 'description') { // Ensure not to consider 'description' as a class
          const option = document.createElement('option');
          option.value = className;
          option.textContent = className;
          classSelect.appendChild(option);
        }
      });
    });
  }

  document.getElementById('addSubjectForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const boardId = document.getElementById('boardSelect').value;
    const classId = document.getElementById('classSelect').value;
    const subjectName = document.getElementById('subjectName').value.trim();

    if (boardId && classId && subjectName) {
      const newSubjectRef = db.ref(`EduVerse/${boardId}/${classId}/${subjectName}`).set({
        name: subjectName
      }).then(() => {
        alert('Subject added successfully!');
        loadSubjects();
      }).catch((error) => {
        console.error('Error adding subject:', error);
        alert('Error adding subject');
      });
    } else {
      alert('Please select board, class and enter subject name.');
    }
  });

  function loadSubjects() {
    const subjectsTable = document.getElementById('subjectsTable');
    subjectsTable.innerHTML = '';

    db.ref('EduVerse').once('value', (snapshot) => {
      snapshot.forEach((boardSnapshot) => {
        const boardId = boardSnapshot.key;
        const boardName = boardSnapshot.key;
        db.ref(`EduVerse/${boardId}`).once('value', (classSnapshot) => {
          classSnapshot.forEach((classChild) => {
            const classId = classChild.key;
            if (classId !== 'description') { // Ensure not to consider 'description' as a class
              const className = classChild.key;
              db.ref(`EduVerse/${boardId}/${classId}`).once('value', (subjectSnapshot) => {
                subjectSnapshot.forEach((subjectChild) => {
                  const subjectId = subjectChild.key;
                  const subjectName = subjectChild.val().name;

                  const row = document.createElement('tr');
                  row.innerHTML = `
                    <td>${boardName}</td>
                    <td>${className}</td>
                    <td>${subjectName}</td>
                    <td>
                      <button class="btn btn-warning btn-sm" onclick="editSubject('${boardId}', '${classId}', '${subjectId}', '${subjectName}')">Edit</button>
                      <button class="btn btn-danger btn-sm" onclick="deleteSubject('${boardId}', '${classId}', '${subjectId}')">Delete</button>
                    </td>
                  `;
                  subjectsTable.appendChild(row);
                });
              });
            }
          });
        });
      });
    });
  }

  window.editSubject = function (boardId, classId, subjectId, currentName) {
    const newName = prompt('Enter new subject name:', currentName);

    if (newName) {
      const updates = {};
      updates[`EduVerse/${boardId}/${classId}/${subjectId}`] = null; // Remove old subject
      updates[`EduVerse/${boardId}/${classId}/${newName}`] = { name: newName }; // Add new subject

      db.ref().update(updates).then(() => {
        alert('Subject updated successfully!');
        loadSubjects();
      }).catch((error) => {
        console.error('Error updating subject:', error);
        alert('Error updating subject');
      });
    }
  };

  window.deleteSubject = function (boardId, classId, subjectId) {
    if (confirm('Are you sure you want to delete this subject?')) {
      db.ref(`EduVerse/${boardId}/${classId}/${subjectId}`).remove()
        .then(() => {
          alert('Subject deleted successfully!');
          loadSubjects();
        })
        .catch((error) => {
          console.error('Error deleting subject:', error);
          alert('Error deleting subject');
        });
    }
  };

  loadBoards();
  loadSubjects();
});
