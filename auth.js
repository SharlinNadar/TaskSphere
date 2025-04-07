import { auth } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Function to Register a New User
const registerUser = async (event) => {
  event.preventDefault(); // Prevent form from submitting traditionally

  const fullname = document.getElementById("fullname").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // Check if passwords match
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User Registered:", userCredential.user);
    alert("Registration Successful! Redirecting to login...");

    // Redirect to login page after successful registration
    window.location.href = "login.html";
  } catch (error) {
    console.error("Error Registering:", error.message);
    alert(error.message);
  }
};

// Function to Login a User
const loginUser = async (event) => {
  event.preventDefault(); // Prevent form from submitting traditionally

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User Logged In:", userCredential.user);
    alert("Login Successful! Redirecting to dashboard...");

    // Redirect to a dashboard or home page after login
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Error Logging In:", error.message);
    alert(error.message);
  }
};

// Attach functions to buttons
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector("form[action='signup_process.php']");
  const loginForm = document.querySelector("form[action='login_process.php']");

  if (registerForm) {
    registerForm.addEventListener("submit", registerUser);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", loginUser);
  }
});
