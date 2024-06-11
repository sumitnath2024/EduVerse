document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const boardId = urlParams.get('boardId');
  const classId = urlParams.get('classId');
  const subjectId = urlParams.get('subjectId');
  const bookId = urlParams.get('bookId');
  const chapterId = urlParams.get('chapterId');
  const chapterStatus = urlParams.get('chapterStatus');
  const db = firebase.database();

  // Function to get the next content ID
  function getNextContentId(callback) {
    db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}/Chapters/${chapterId}/Contents`).orderByKey().limitToLast(1).once('value', (snapshot) => {
      let nextId = 'CNT001';
      snapshot.forEach((childSnapshot) => {
        const lastId = childSnapshot.key;
        const lastNum = parseInt(lastId.substring(3));
        nextId = 'CNT' + String(lastNum + 1).padStart(3, '0');
      });
      callback(nextId);
    });
  }

  // Function to add a new content
  document.getElementById('contentForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const contentName = document.getElementById('contentName').value.trim();
    const contentImageLink = document.getElementById('contentImageLink').value.trim();
    const contentLink = document.getElementById('contentLink').value.trim();
    const contentStatus = chapterStatus === 'paid' ? 'paid' : document.getElementById('contentStatus').value;

    if (contentName && contentImageLink && contentLink) {
      getNextContentId((nextContentId) => {
        db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}/Chapters/${chapterId}/Contents/${nextContentId}`).set({
          name: contentName,
          imageLink: contentImageLink,
          link: contentLink,
          status: contentStatus
        }).then(() => {
          alert('Content added successfully!');
          document.getElementById('contentForm').reset();
          loadContents();
        }).catch((error) => {
          console.error('Error adding content:', error);
          alert('Error adding content');
        });
      });
    } else {
      alert('Please fill out all fields.');
    }
  });

  // Function to load all contents and display them in the table
  function loadContents() {
    const contentsTable = document.getElementById('contentsTable');
    contentsTable.innerHTML = '';

    db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}/Chapters/${chapterId}/Contents`).once('value', (snapshot) => {
      snapshot.forEach((contentSnapshot) => {
        const contentId = contentSnapshot.key;
        const contentData = contentSnapshot.val();
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${contentData.name}</td>
          <td><a href="${contentData.imageLink}" target="_blank">View Image</a></td>
          <td><a href="${contentData.link}" target="_blank">View Content</a></td>
          <td>
            <select class="form-control" ${chapterStatus === 'paid' ? 'disabled' : ''} onchange="updateContentStatus('${contentId}', this.value)">
              <option value="free" ${contentData.status === 'free' ? 'selected' : ''}>Free</option>
              <option value="paid" ${contentData.status === 'paid' ? 'selected' : ''}>Paid</option>
            </select>
          </td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editContent('${contentId}', '${contentData.name}', '${contentData.imageLink}', '${contentData.link}', '${contentData.status}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteContent('${contentId}')">Delete</button>
          </td>
        `;
        contentsTable.appendChild(row);
      });
    });
  }

  // Function to update content status
  window.updateContentStatus = function (contentId, newStatus) {
    db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}/Chapters/${chapterId}/Contents/${contentId}`).update({
      status: newStatus
    }).then(() => {
      alert('Content status updated successfully!');
    }).catch((error) => {
      console.error('Error updating content status:', error);
      alert('Error updating content status');
    });
  };

  // Function to edit a content
  window.editContent = function (contentId, currentName, currentImageLink, currentLink, currentStatus) {
    const newName = prompt('Enter new content name:', currentName);
    const newImageLink = prompt('Enter new content image link:', currentImageLink);
    const newLink = prompt('Enter new content link:', currentLink);
    const newStatus = chapterStatus === 'paid' ? 'paid' : prompt('Enter new content status (free/paid):', currentStatus);

    if (newName && newImageLink && newLink && newStatus) {
      db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}/Chapters/${chapterId}/Contents/${contentId}`).update({
        name: newName,
        imageLink: newImageLink,
        link: newLink,
        status: newStatus
      }).then(() => {
        alert('Content updated successfully!');
        loadContents();
      }).catch((error) => {
        console.error('Error updating content:', error);
        alert('Error updating content');
      });
    }
  };

  // Function to delete a content
  window.deleteContent = function (contentId) {
    if (confirm('Are you sure you want to delete this content?')) {
      db.ref(`EduVerse/${boardId}/${classId}/${subjectId}/Books/${bookId}/Chapters/${chapterId}/Contents/${contentId}`).remove()
        .then(() => {
          alert('Content deleted successfully!');
          loadContents();
        })
        .catch((error) => {
          console.error('Error deleting content:', error);
          alert('Error deleting content');
        });
    }
  };

  // Load contents on page load
  loadContents();
});
