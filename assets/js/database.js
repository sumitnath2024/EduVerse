// database.js

// Function to add data
function addData(collection, docId, data) {
    db.collection(collection).doc(docId).set(data)
        .then(() => {
            console.log("Document successfully written!");
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
}

// Function to read data
function getData(collection, docId) {
    db.collection(collection).doc(docId).get()
        .then((doc) => {
            if (doc.exists) {
                console.log("Document data:", doc.data());
            } else {
                console.log("No such document!");
            }
        })
        .catch((error) => {
            console.log("Error getting document:", error);
        });
}

// Function to update data
function updateData(collection, docId, data) {
    db.collection(collection).doc(docId).update(data)
        .then(() => {
            console.log("Document successfully updated!");
        })
        .catch((error) => {
            console.error("Error updating document: ", error);
        });
}

// Function to delete data
function deleteData(collection, docId) {
    db.collection(collection).doc(docId).delete()
        .then(() => {
            console.log("Document successfully deleted!");
        })
        .catch((error) => {
            console.error("Error deleting document: ", error);
        });
}
