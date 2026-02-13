import { onMessage } from "firebase/messaging"
import { messaging } from "./firebase"
import { toast } from "sonner"

export const initForegroundNotifications = () => {
  if (!messaging) {
    console.log("❌ Messaging not supported")
    return
  }

  // ✅ Handle messages when app is in foreground (open and focused)
  onMessage(messaging, (payload) => {
    console.log("📩 Foreground message:", payload)

    const title = payload.notification?.title || "Notification"
    const body = payload.notification?.body || ""

    // Show toast notification
    toast.warning(title, {
      description: body,
      duration: 6000,
    })

    // ✅ ALSO show browser notification even in foreground
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/vite.svg",
        badge: "/vite.svg",
        tag: payload.data?.productId || "general",
      })
    }
  })

  console.log("✅ Foreground notifications initialized")
}