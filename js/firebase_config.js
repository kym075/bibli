// Firebase設定ファイル
// 注意: 本番環境では、これらの設定値を環境変数から取得するか、
// Firebaseコンソールから取得した実際の値に置き換えてください

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com"
};

// Firebaseの初期化（モジュール形式の場合はimport/exportを使用）
// CDN経由で使用する場合は、HTMLで先にFirebaseスクリプトを読み込んでください

let app = null;
let db = null;
let auth = null;

// Firebase初期化関数
function initializeFirebase() {
    if (typeof firebase !== 'undefined') {
        // Firebase SDKがCDN経由で読み込まれている場合
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.app();
        }
        db = firebase.firestore();
        auth = firebase.auth();
        console.log('Firebase initialized successfully');
        return true;
    } else {
        console.warn('Firebase SDK not loaded. Please include Firebase scripts in your HTML.');
        return false;
    }
}

// Firestoreへの参照を取得
function getFirestore() {
    return db;
}

// Authへの参照を取得
function getAuth() {
    return auth;
}

// 現在のユーザーIDを取得（ログインしていない場合はnull）
function getCurrentUserId() {
    if (auth && auth.currentUser) {
        return auth.currentUser.uid;
    }
    // デモ用：ローカルストレージからユーザーIDを取得
    return localStorage.getItem('userId') || 'demo_user_001';
}

// デモ用のユーザーID設定
function setDemoUserId(userId) {
    localStorage.setItem('userId', userId);
}
