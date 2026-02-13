import admin from "firebase-admin"
import { env } from "./env.js"

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FB_PROJECT_ID,
      clientEmail: env.FB_CLIENT_EMAIL,
      privateKey: env.FB_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  })
}

export default admin
