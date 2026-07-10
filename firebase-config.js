const firebaseConfig = {
  apiKey: "AIzaSyAaYrRbAQPY6WnGDi0tPyDXn60ehGTQiiQ",
  authDomain: "emotion-map-b68dd.firebaseapp.com",
  databaseURL: "https://emotion-map-b68dd-default-rtdb.firebaseio.com",
  projectId: "emotion-map-b68dd",
  storageBucket: "emotion-map-b68dd.firebasestorage.app",
  messagingSenderId: "715643955019",
  appId: "1:715643955019:web:19ea53bcc05c4512b96ace"
};

// Initialize Firebase using compat globals
firebase.initializeApp(firebaseConfig);
window.db = firebase.database();
