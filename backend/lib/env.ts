function getEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

export const env = {
  FB_PROJECT_ID: getEnv("FB_PROJECT_ID"),
  FB_CLIENT_EMAIL: getEnv("FB_CLIENT_EMAIL"),
  FB_PRIVATE_KEY: getEnv("FB_PRIVATE_KEY"),
}