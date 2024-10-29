declare global {
  namespace NodeJS {
    interface ProcessEnv extends Record<
      | 'API_URL'
      | 'PORT'
      | 'APPLICATION_SECRET'
      | 'MONGODB_URL'
      | 'GODMODE_USERNAME'
      | 'GODMODE_PASSWORD'
      | 'STORAGE_PATH'
      | 'STORAGE_TEMP_PATH'
      | 'DISCORD_API_SECRET'
      | 'DISCORD_BOT_TOKEN'
      | 'DISCORD_MAIN_SERVER_ID'
      | 'DISCORD_ANNOUNCEMENTS_CHANNEL_ID'
      | "ZAPMEOW_CHECK_USER_URL"
      | "ZAPMEOW_SEND_TEXT_URL"
      | "ZAPMEOW_SEND_IMAGE_URL"
      | "ZAPMEOW_INSTACE_ID",
      string
    > {}
  }
}

export {}
