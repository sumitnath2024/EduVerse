document.addEventListener('DOMContentLoaded', function () {
  const db = firebase.database();

  // Function to load board names into the select dropdown
  function loadBoards() {
    const boardSelect = document.getElementById('boardName');
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

  document.getElementById('boardName').addEventListener('change', function () {
    loadClasses(this.value);
  });

  function loadClasses(boardId) {
    const classSelect = document.getElementById('className');
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

  document.getElementById('className').addEventListener('change', function () {
    loadSubjects(document.getElementById('boardName').value, this.value);
  });

  function loadSubjects(boardId, classId) {
    const subjectSelect = document.getElementById('subjectName');
    db.ref(`EduVerse/${boardId}/${classId}`).once('value', function (snapshot) {
      subjectSelect.innerHTML = '<option value="" selected disabled>Select Subject</option>';
      snapshot.forEach(function (childSnapshot) {
        if (childSnapshot.key !== 'name') {
          const subjectName = childSnapshot.key;
          const option = document.createElement('option');
          option.value = subjectName;
          option.textContent = subjectName;
          subjectSelect.appendChild(option);
        }
      });
    });
  }

  document.getElementById('subjectName').addEventListener('change', function () {
    loadBooks(document.getElementById('boardName').value, document.getElementById('className').value, this.value);
  });

  function loadBooks(boardId, classId, subjectId) {
    const bookSelect = document.getElementById('book');
    db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books`).once('value', function (snapshot) {
      bookSelect.innerHTML = '<option value="" selected disabled>Select Book</option>';
      snapshot.forEach(function (childSnapshot) {
        const bookId = childSnapshot.key;
        const bookName = childSnapshot.val().name; // Fetching the name of the book
        const option = document.createElement('option');
        option.value = bookId;
        option.textContent = bookName;
        bookSelect.appendChild(option);
      });
    });
  }

  document.getElementById('book').addEventListener('change', function () {
    loadChapters(document.getElementById('boardName').value, document.getElementById('className').value, document.getElementById('subjectName').value, this.value);
  });

  // Function to get the next chapter ID
  function getNextChapterId(boardId, classId, subjectId, bookId, callback) {
    db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}/Chapters`).orderByKey().limitToLast(1).once('value', (snapshot) => {
      let nextId = 'C001';
      snapshot.forEach((childSnapshot) => {
        const lastId = childSnapshot.key;
        const lastNum = parseInt(lastId.substring(1));
        nextId = 'C' + String(lastNum + 1).padStart(3, '0');
      });
      callback(nextId);
    });
  }

  // Function to add a new chapter
  document.getElementById('chapterForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const boardId = document.getElementById('boardName').value;
    const classId = document.getElementById('className').value;
    const subjectId = document.getElementById('subjectName').value;
    const bookId = document.getElementById('book').value;
    const chapterName = document.getElementById('chapterName').value.trim();
    const chapterImageLink = document.getElementById('chapterImageLink').value.trim();
    const chapterStatus = document.getElementById('chapterStatus').value;

    if (boardId && classId && subjectId && bookId && chapterName && chapterImageLink && chapterStatus) {
      getNextChapterId(boardId, classId, subjectId, bookId, (nextChapterId) => {
        db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}/Chapters/${nextChapterId}`).set({
          name: chapterName,
          imageLink: chapterImageLink,
          status: chapterStatus
        }).then(() => {
          alert('Chapter added successfully!');
          document.getElementById('chapterForm').reset();
          loadChapters(boardId, classId, subjectId, bookId);
        }).catch((error) => {
          console.error('Error adding chapter:', error);
          alert('Error adding chapter');
        });
      });
    } else {
      alert('Please fill out all fields.');
    }
  });

  // Function to load all chapters and display them in the table
  function loadChapters(boardId, classId, subjectId, bookId) {
    const chaptersTable = document.getElementById('chaptersTable');
    chaptersTable.innerHTML = '';

    db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}/Chapters`).once('value', (snapshot) => {
      snapshot.forEach((chapterSnapshot) => {
        const chapterId = chapterSnapshot.key;
        const chapterData = chapterSnapshot.val();
        db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}`).once('value', (bookSnapshot) => {
          const bookName = bookSnapshot.val().name; // Fetching the book name from the database
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${bookName}</td>
            <td>${chapterData.name}</td>
            <td><a href="${chapterData.imageLink}" target="_blank">View Image</a></td>
            <td>
              <select class="form-control" onchange="updateChapterStatus('${boardId}', '${classId}', '${subjectId}', '${bookId}', '${chapterId}', this.value)">
                <option value="free" ${chapterData.status === 'free' ? 'selected' : ''}>Free</option>
                <option value="paid" ${chapterData.status === 'paid' ? 'selected' : ''}>Paid</option>
              </select>
            </td>
            <td>
              <button class="btn btn-primary btn-sm" onclick="window.location.href='manage-contents.html?boardId=${boardId}&classId=${classId}&subjectId=${subjectId}&bookId=${bookId}&chapterId=${chapterId}&chapterStatus=${chapterData.status}'">Contents</button>
              <button class="btn btn-warning btn-sm" onclick="editChapter('${boardId}', '${classId}', '${subjectId}', '${bookId}', '${chapterId}', '${chapterData.name}', '${chapterData.imageLink}', '${chapterData.status}')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deleteChapter('${boardId}', '${classId}', '${subjectId}', '${bookId}', '${chapterId}')">Delete</button>
            </td>
          `;
          chaptersTable.appendChild(row);
        });
      });
    });
  }

  // Function to update chapter status
  window.updateChapterStatus = function (boardId, classId, subjectId, bookId, chapterId, newStatus) {
    db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}/Chapters/${chapterId}`).update({
      status: newStatus
    }).then(() => {
      alert('Chapter status updated successfully!');
      if (newStatus === 'paid') {
        // Update all content statuses to 'paid'
        db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}/Chapters/${chapterId}/Contents`).once('value', (snapshot) => {
          snapshot.forEach((contentSnapshot) => {
            db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}/Chapters/${chapterId}/Contents/${contentSnapshot.key}`).update({
              status: 'paid'
            });
          });
        });
      }
    }).catch((error) => {
      console.error('Error updating chapter status:', error);
      alert('Error updating chapter status');
    });
  };

  // Function to edit a chapter
  window.editChapter = function (boardId, classId, subjectId, bookId, chapterId, currentName, currentImageLink, currentStatus) {
    const newName = prompt('Enter new chapter name:', currentName);
    const newImageLink = prompt('Enter new chapter image link:', currentImageLink);
    const newStatus = prompt('Enter new chapter status (free/paid):', currentStatus);

    if (newName && newImageLink && newStatus) {
      db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}/Chapters/${chapterId}`).update({
        name: newName,
        imageLink: newImageLink,
        status: newStatus
      }).then(() => {
        alert('Chapter updated successfully!');
        loadChapters(boardId, classId, subjectId, bookId);
      }).catch((error) => {
        console.error('Error updating chapter:', error);
        alert('Error updating chapter');
      });
    }
  };

  // Function to delete a chapter
  window.deleteChapter = function (boardId, classId, subjectId, bookId, chapterId) {
    if (confirm('Are you sure you want to delete this chapter?')) {
      db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}/Chapters/${chapterId}`).remove()
        .then(() => {
          alert('Chapter deleted successfully!');
          loadChapters(boardId, classId, subjectId, bookId);
        })
        .catch((error) => {
          console.error('Error deleting chapter:', error);
          alert('Error deleting chapter');
        });
    }
  };

  // Load boards on page load
  loadBoards();
});
