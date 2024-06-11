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

  // Function to load class names based on selected board
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

  // Function to load subject names based on selected class
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

  // Function to get the next book ID
  function getNextBookId(boardId, classId, subjectId, callback) {
    db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books`).orderByKey().limitToLast(1).once('value', (snapshot) => {
      let nextId = 'B001'; // Default starting ID
      snapshot.forEach((childSnapshot) => {
        const lastId = childSnapshot.key;
        const lastNum = parseInt(lastId.substring(1)); // Extract number from ID
        nextId = 'B' + String(lastNum + 1).padStart(3, '0'); // Increment and format ID
      });
      callback(nextId);
    });
  }

  // Function to add a new book
  document.getElementById('addBookForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const boardId = document.getElementById('boardName').value;
    const classId = document.getElementById('className').value;
    const subjectId = document.getElementById('subjectName').value;
    const bookName = document.getElementById('bookName').value.trim();
    const author = document.getElementById('author').value.trim();
    const publisher = document.getElementById('publisher').value.trim();
    const coverImageLink = document.getElementById('coverImageLink').value.trim();

    if (boardId && classId && subjectId && bookName && author && publisher && coverImageLink) {
      getNextBookId(boardId, classId, subjectId, (nextBookId) => {
        db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${nextBookId}`).set({
          name: bookName,
          author: author,
          publisher: publisher,
          coverImageUrl: coverImageLink
        }).then(() => {
          alert('Book added successfully!');
          document.getElementById('addBookForm').reset();
          loadBooks();
        }).catch((error) => {
          console.error('Error adding book:', error);
          alert('Error adding book');
        });
      });
    } else {
      alert('Please fill out all fields.');
    }
  });

  // Function to load all books and display them in the table
  function loadBooks() {
    const booksTable = document.getElementById('booksTable');
    booksTable.innerHTML = '';

    db.ref('EduVerse').once('value', (snapshot) => {
      snapshot.forEach((boardSnapshot) => {
        const boardId = boardSnapshot.key;
        const boardName = boardSnapshot.key;
        boardSnapshot.forEach((classSnapshot) => {
          const classId = classSnapshot.key;
          if (classId !== 'description') {
            const className = classSnapshot.key;
            classSnapshot.forEach((subjectSnapshot) => {
              const subjectId = subjectSnapshot.key;
              if (subjectId !== 'name') {
                const subjectName = subjectSnapshot.key;
                const booksRef = db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books`);
                booksRef.once('value', (booksSnapshot) => {
                  booksSnapshot.forEach((bookSnapshot) => {
                    const bookId = bookSnapshot.key;
                    const bookData = bookSnapshot.val();
                    const row = document.createElement('tr');
                    row.innerHTML = `
                      <td>${boardName}</td>
                      <td>${className}</td>
                      <td>${subjectName}</td>
                      <td>${bookData.name}</td>
                      <td>${bookData.author}</td>
                      <td>${bookData.publisher}</td>
                      <td><a href="${bookData.coverImageUrl}" target="_blank">View Cover Image</a></td>
                      <td>
                        <button class="btn btn-warning btn-sm" onclick="editBook('${boardId}', '${classId}', '${subjectId}', '${bookId}', '${bookData.name}', '${bookData.author}', '${bookData.publisher}', '${bookData.coverImageUrl}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteBook('${boardId}', '${classId}', '${subjectId}', '${bookId}')">Delete</button>
                      </td>
                    `;
                    booksTable.appendChild(row);
                  });
                });
              }
            });
          }
        });
      });
    });
  }

  // Function to edit a book
  window.editBook = function (boardId, classId, subjectId, bookId, currentName, currentAuthor, currentPublisher, currentCoverImageUrl) {
    const newName = prompt('Enter new book name:', currentName);
    const newAuthor = prompt('Enter new author name:', currentAuthor);
    const newPublisher = prompt('Enter new publisher name:', currentPublisher);
    const newCoverImageUrl = prompt('Enter new cover image link:', currentCoverImageUrl);

    if (newName && newAuthor && newPublisher && newCoverImageUrl) {
      db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}`).update({
        name: newName,
        author: newAuthor,
        publisher: newPublisher,
        coverImageUrl: newCoverImageUrl
      }).then(() => {
        alert('Book updated successfully!');
        loadBooks();
      }).catch((error) => {
        console.error('Error updating book:', error);
        alert('Error updating book');
      });
    }
  };

  // Function to delete a book
  window.deleteBook = function (boardId, classId, subjectId, bookId) {
    if (confirm('Are you sure you want to delete this book?')) {
      db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}`).remove()
        .then(() => {
          alert('Book deleted successfully!');
          loadBooks();
        })
        .catch((error) => {
          console.error('Error deleting book:', error);
          alert('Error deleting book');
        });
    }
  };

  // Load boards, classes, and subjects on page load
  loadBoards();
  loadBooks();
});
