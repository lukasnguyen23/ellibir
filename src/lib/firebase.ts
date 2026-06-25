import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';

/** Safari (Desktop + iOS): Fetch Streams können onSnapshot verzögern (firebase-js-sdk #9789). */
function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|EdgiOS|OPR|Opera/i.test(ua);
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function assertFirebaseConfig(): void {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Firebase-Konfiguration unvollständig. Fehlende Variablen: ${missing.join(', ')}. ` +
        'Kopiere .env.example nach .env und trage deine Firebase-Werte ein.',
    );
  }
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    assertFirebaseConfig();
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    const firebaseApp = getFirebaseApp();
    if (isSafari()) {
      // useFetchStreams supported at runtime but omitted from public FirestoreSettings types.
      const safariSettings = {
        useFetchStreams: false,
        experimentalForceLongPolling: true,
      } as Parameters<typeof initializeFirestore>[1];
      db = initializeFirestore(firebaseApp, safariSettings);
    } else {
      db = getFirestore(firebaseApp);
    }
  }
  return db;
}
