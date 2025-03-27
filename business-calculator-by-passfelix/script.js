// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, createUser WithEmailAndPassword, signOut, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBbnGag71QsQ99ySj-qzPW9vbr9SpqHJqg",
    authDomain: "business-calculator-99709.firebaseapp.com",
    projectId: "business-calculator-99709",
    storageBucket: "business-calculator-99709.appspot.com",
    messagingSenderId: "256233168490",
    appId: "1:256233168490:web:8013986ba40aa23bdef413",
    measurementId: "G-CCW4CZFHC2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Function to sign up
window.signUp = function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    createUser WithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            showToast('Sign up successful!', 'success');
        })
        .catch((error) => {
            const errorMessage = error.message;
            showToast(errorMessage, 'error');
        });
};

// Function to log in
window.login = function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            showToast('Login successful!', 'success');
            // Show calculator section
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('calculatorSection').classList.remove('hidden');
        })
        .catch((error) => {
            const errorMessage = error.message;
            showToast(errorMessage, 'error');
        });
};

// Function to log out
window.logout = function() {
    signOut(auth).then(() => {
        showToast('Logged out successfully!', 'success');
        document.getElementById('calculatorSection').classList.add('hidden');
        document.getElementById('loginSection').classList.remove('hidden');
    }).catch((error) => {
        showToast(error.message, 'error');
    });
};

// Function to send OTP
window.sendOtp = function() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    const appVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
        .then((confirmationResult) => {
            const code = prompt('Enter the OTP sent to your phone:');
            return confirmationResult.confirm(code);
        })
        .then((result) => {
            const user = result.user;
            showToast('Phone number verified!', 'success');
        })
        .catch((error) => {
            showToast(error.message, 'error');
        });
};

// Function to show toast notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Additional functions for calculator functionality can be added here