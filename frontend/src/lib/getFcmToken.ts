import { deleteToken, getToken } from "firebase/messaging"
import { messaging } from "../lib/firebase"
import { api } from "../lib/api"
import { toast } from "sonner"

export async function registerPush() {
  console.log("🚀 registerPush called")

  if (!messaging) {
    console.log("❌ Messaging not supported in this browser")
    return false
  }

  try {
    // ✅ Register service worker first
    const registration = await navigator.serviceWorker.register(
      `https://www.everkelglobalventures.com/firebase-messaging-sw.js`
    )
    console.log("✅ Service Worker registered:", registration)

    // ✅ Request notification permission
    const permission = await Notification.requestPermission()
    console.log("🔔 Notification permission:", permission)

    if (permission !== "granted") {
      toast.error("Notification permission denied")
      return false
    }

    // ✅ Get FCM token with service worker
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FB_VAPID_KEY,
      serviceWorkerRegistration: registration,
    })

    if (!token) {
      console.error("❌ No FCM token received")
      return false
    }

    console.log("🔥 FCM TOKEN:", token)

    // ✅ Send token to backend
    await api.post("/push/register", { token })
    console.log("✅ Token registered on server")

    toast.success("Notifications enabled!")
    return true
  } catch (error) {
    console.error("❌ Push registration error:", error)
    toast.error("Failed to enable notifications")
    return false
  }
}

// ✅ Helper to check if notifications are enabled
export function areNotificationsEnabled(): boolean {
  return "Notification" in window && Notification.permission === "granted"
}


export async function unregisterPush() {
  try {
    if (!messaging) return

    const token = await getToken(messaging)
    if(token){
      await deleteToken(messaging)
    }

    await api.delete("/push/remove")

    console.log("Pushed token away")
  } catch (err) {
    console.error("Failed to unregister push:", err)
  }
}