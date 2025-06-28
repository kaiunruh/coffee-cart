'use client';

import { useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_FIREBASE_PROJECT.firebaseapp.com',
  projectId: 'YOUR_FIREBASE_PROJECT',
  storageBucket: 'YOUR_FIREBASE_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

export default function FcmTokenFetcher() {
  useEffect(() => {
    if (typeof window === 'undefined') return; // ensure browser-only

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const messaging = getMessaging(app);

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        getToken(messaging, {
          vapidKey: 'YOUR_WEB_PUSH_CERTIFICATE_KEY_PAIR',
        })
          .then((currentToken) => {
            if (currentToken) {
              console.log('📲 FCM Device Token:', currentToken);
              alert('FCM device token logged in console!');
            } else {
              console.warn('No registration token available.');
            }
          })
          .catch((err) => {
            console.error('An error occurred while retrieving token.', err);
          });
      } else {
        console.warn('Notification permission not granted');
      }
    });
  }, []);

  return null; // doesn't render anything visible
}
