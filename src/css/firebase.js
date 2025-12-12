// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB-MZHfYzwZ-uUjuE_gNFLO44G3jO9xF6g",
  authDomain: "bibli-12f66.firebaseapp.com",
  projectId: "bibli-12f66",
  storageBucket: "bibli-12f66.firebasestorage.app",
  messagingSenderId: "1008130646964",
  appId: "1:1008130646964:web:50962c5ea483ea7721c8e1",
};

// Firebase 初期化
const app = initializeApp(firebaseConfig);

// Firebase Auth を export（React で必ず使う）
export const auth = getAuth(app);
