import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  enableNetwork,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFZwkf-8rndj6X4h7RcvmQ5H5kQIN2Uu0",
  authDomain: "taskmanagementapp-829eb.firebaseapp.com",
  databaseURL: "https://taskmanagementapp-829eb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "taskmanagementapp-829eb",
  storageBucket: "taskmanagementapp-829eb.appspot.com",
  messagingSenderId: "164670724790",
  appId: "1:164670724790:web:4db9cf69ab339a12802417",
  measurementId: "G-3EZWWFYGQ6"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("🔥 Firebase initialized successfully!");

// ✅ Enable Firestore Network
async function initializeFirestore() {
  try {
    await enableNetwork(db);
    console.log("✅ Firestore is online!");
  } catch (error) {
    console.error("❌ Error enabling Firestore network:", error);
  }
}
initializeFirestore();

// ✅ Show Modal Message
function showModal(message) {
  const modal = document.getElementById("modal");
  const modalMessage = document.getElementById("modal-message");

  if (modal && modalMessage) {
    modalMessage.textContent = message;
    modal.style.display = "block";

    document.querySelectorAll(".close-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        modal.style.display = "none";
      });
    });

    setTimeout(() => {
      modal.style.display = "none";
    }, 3000);
  } else {
    alert(message); // Fallback
  }
}

// ✅ Register User
async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email: email,
      uid: user.uid,
      role: "user"
    });

    showModal("✅ Registration successful! Redirecting...");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 3000);
  } catch (error) {
    console.error("❌ Registration error:", error);
    showModal("Error: " + error.message);
  }
}

// ✅ Login User
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      localStorage.setItem("userRole", userData.role);
      localStorage.setItem("userId", user.uid);
    }

    showModal("✅ Login successful! Redirecting...");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 3000);
  } catch (error) {
    console.error("❌ Login error:", error);
    showModal("Error: " + error.message);
  }
}

// ✅ Logout User
async function logoutUser() {
  try {
    await signOut(auth);
    localStorage.clear();
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout failed:", error);
    showModal("Error: " + error.message);
  }
}

export { app, db, auth, registerUser, loginUser, logoutUser, showModal };
