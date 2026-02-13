importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js")

firebase.initializeApp({
  apiKey: "AIzaSyAPuQpCxZVNuf9fNXRz96AHkXxdugm1afg",
  authDomain: "everkel-94e67.firebaseapp.com",
  projectId: "everkel-94e67",
  messagingSenderId: "981524576406",
  storageBucket: "everkel-94e67.firebasestorage.app",
  appId: "1:981524576406:web:536e5588d97e4c39a5eab7",
})

const messaging = firebase.messaging()

//✅ Handle background messages (when app is closed/minimized)
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received:", payload)

  const notificationTitle = payload.notification?.title || "New Notification"
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/vite.svg", // Your app icon
    badge: "/vite.svg",
    tag: payload.data?.productId || "general",
    requireInteraction: true, // Stays until user clicks
    data: payload.data,
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// ✅ Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Notification clicked:", event)

  event.notification.close()

  // Open or focus your app
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && "focus" in client) {
          return client.focus()
        }
      }

      // Otherwise, open new window
      if (clients.openWindow) {
        return clients.openWindow("/")
      }
    })
  )
})



// // public/firebase-messaging-sw.js
// importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js")
// importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js")

// // Replace with your actual Firebase config
// firebase.initializeApp({
//   apiKey: "AIzaSyAPuQpCxZVNuf9fNXRz96AHkXxdugm1afg",
//   authDomain: "everkel-94e67.firebaseapp.com",
//   projectId: "everkel-94e67",
//   messagingSenderId: "981524576406",
//   storageBucket: "everkel-94e67.firebasestorage.app",
//   appId: "1:981524576406:web:536e5588d97e4c39a5eab7",
// })

// const messaging = firebase.messaging()

// // ✅ Handle background messages (when app is closed/minimized)
// messaging.onBackgroundMessage((payload) => {
//   console.log("📩 Background notification received:", payload)

//   const notificationTitle = payload.notification?.title || "New Notification"
//   const notificationOptions = {
//     body: payload.notification?.body || "",
//     icon: "/vite.svg",
//     badge: "/vite.svg",
//     requireInteraction: true,
//   }

//   self.registration.showNotification(notificationTitle, notificationOptions)
// })

// ✅ Handle notification clicks
// self.addEventListener("notificationclick", (event) => {
//   console.log("🔔 Notification clicked:", event)

//   event.notification.close()

//   // Open or focus your app
//   event.waitUntil(
//     clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
//       // If app is already open, focus it
//       for (const client of clientList) {
//         if (client.url.includes(self.registration.scope) && "focus" in client) {
//           return client.focus()
//         }
//       }

//       // Otherwise, open new window
//       if (clients.openWindow) {
//         return clients.openWindow("/")
//       }
//     })
//   )
// })



// /* eslint-disable no-undef */
// importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js")
// importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js")

// firebase.initializeApp({
//   apiKey: "AIzaSyAPuQpCxZVNuf9fNXRz96AHkXxdugm1afg",
//   authDomain: "everkel-94e67.firebaseapp.com",
//   projectId: "everkel-94e67",
//   messagingSenderId: "981524576406",
//   appId: "1:981524576406:web:536e5588d97e4c39a5eab7",
// })

// const messaging = firebase.messaging()

// messaging.onBackgroundMessage((payload) => {
//   self.registration.showNotification(payload.notification.title, {
//     body: payload.notification.body,
//     icon: "/logo.png",
//   })
// })