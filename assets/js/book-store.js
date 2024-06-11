document.addEventListener('DOMContentLoaded', function () {
  const db = firebase.database();
  const recommendedCarousel = document.querySelector('#recommendedCarousel .carousel-inner');
  const booksCarousel = document.querySelector('#booksCarousel .carousel-inner');

  // Function to convert Google Drive link to direct image link
  function getDirectImageLink(driveLink) {
    const fileId = driveLink.match(/[-\w]{25,}/);
    return fileId ? `https://drive.google.com/uc?export=view&id=${fileId[0]}` : driveLink;
  }

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

  // Function to load subject names based on selected class
  function loadSubjects(boardId, classId) {
    const subjectSelect = document.getElementById('subject');
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

  // Event listeners for board, class, and subject selections
  document.getElementById('board').addEventListener('change', function () {
    loadClasses(this.value);
  });

  document.getElementById('class').addEventListener('change', function () {
    loadSubjects(document.getElementById('board').value, this.value);
  });

  document.getElementById('subject').addEventListener('change', function () {
    loadBooks(document.getElementById('board').value, document.getElementById('class').value, this.value);
  });

  // Function to load books based on board, class, and subject
  function loadBooks(boardId, classId, subjectId) {
    booksCarousel.innerHTML = ''; // Clear the existing books
    db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books`).once('value', function (snapshot) {
      let isActive = true;
      snapshot.forEach(function (childSnapshot) {
        const book = childSnapshot.val();
        const coverImageUrl = getDirectImageLink(book.coverImageUrl);
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (isActive) {
          carouselItem.classList.add('active');
          isActive = false;
        }
        carouselItem.innerHTML = `
          <div class="book-card">
            <img src="${coverImageUrl}" alt="${book.name}">
            <p>${book.name}</p>
          </div>
        `;
        booksCarousel.appendChild(carouselItem);
      });
    });
  }

  // Function to load recommended books
  function loadRecommendedBooks() {
    // Placeholder logic to fetch recommended books based on user profile
    db.ref('EduVerse/CBSE/Class I/English/Books').orderByChild('recommended').equalTo(true).once('value', function (snapshot) {
      let isActive = true;
      snapshot.forEach(function (childSnapshot) {
        const book = childSnapshot.val();
        const coverImageUrl = getDirectImageLink(book.coverImageUrl);
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (isActive) {
          carouselItem.classList.add('active');
          isActive = false;
        }
        carouselItem.innerHTML = `
          <div class="book-card">
            <img src="${coverImageUrl}" alt="${book.name}">
            <p>${book.name}</p>
          </div>
        `;
        recommendedCarousel.appendChild(carouselItem);
      });
    });
  }

  // Load initial data
  loadBoards();
  loadRecommendedBooks();
});
