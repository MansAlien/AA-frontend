// Firebase Cloud Messaging service worker: shows push notifications while the
// site is in the background or closed. Foreground pushes are handled in the
// app (WebPushController). Registered by firebase_messaging's getToken() under
// its own scope (/firebase-cloud-messaging-push-scope), so it does not clash
// with the kill-switch flutter_service_worker.js at "/".
//
// The SDK version must match the Firebase JS SDK that firebase_core_web loads
// (supportedFirebaseJsSdkVersion in its firebase_sdk_version.dart).

// Registered before the SDK import so it handles clicks on the notifications
// the SDK displays. The site's pages are not controlled by this worker (it has
// its own scope), so client.navigate() would reject: focus the open tab and
// ask the app to route to Notifications instead (lib/core/service/web_push/
// notification_click_listener_web.dart), or open a new tab there.
const OPEN_NOTIFICATIONS = "ammar:open-notifications";

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const windows = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const tab = windows.find(
        (client) => new URL(client.url).origin === self.location.origin,
      );
      if (tab) {
        try {
          await tab.focus();
        } catch (error) {
          // Focus can be refused; still route the tab.
        }
        tab.postMessage(OPEN_NOTIFICATIONS);
        return;
      }
      await clients.openWindow("/notifications");
    })(),
  );
});

importScripts(
  "https://www.gstatic.com/firebasejs/12.3.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/12.3.0/firebase-messaging-compat.js",
);

// Same web app config as lib/firebase_options.dart (these values are public).
firebase.initializeApp({
  apiKey: "AIzaSyDNH5YRvXONk6yW9Wfv3GV_uPrhbOGV5sw",
  appId: "1:408680883858:web:be6ae7611461e7128c684b",
  messagingSenderId: "408680883858",
  projectId: "ammar-academy-457c9",
  authDomain: "ammar-academy-457c9.firebaseapp.com",
  storageBucket: "ammar-academy-457c9.firebasestorage.app",
  measurementId: "G-WXZLR1BNV6",
});

// The backend sends `notification` payloads, which the SDK shows by itself
// in the background; nothing else to do here.
firebase.messaging();
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="10f47233-5285-5365-853c-90cfb508ff50")}catch(e){}}();
//# debugId=10f47233-5285-5365-853c-90cfb508ff50
