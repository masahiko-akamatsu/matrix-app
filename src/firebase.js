import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCHIgj0oSWhm2QqItbj8HDSoWdXjfbvIb0",
  authDomain: "matrix-app-2612e.firebaseapp.com",
  projectId: "matrix-app-2612e",
  storageBucket: "matrix-app-2612e.firebasestorage.app",
  messagingSenderId: "146811113429",
  appId: "1:146811113429:web:5cad825afcb03d461e375c",
  measurementId: "G-C6RQXH3VRN"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
