import { init } from "aeria";
import { router } from "./routes/index.js";
export * as collections from "./collections/index.js";

export default init({
  router,
  config: {
    baseUrl: "/api",
    publicUrl: process.env.API_URL,
    secret: process.env.APPLICATION_SECRET,
    port: 3000,
    database: {
      mongodbUrl: process.env.MONGODB_URL,
    },
    defaultUser: {
      username: process.env.GODMODE_USERNAME,
      password: process.env.GODMODE_PASSWORD,
    },
    storage: {
      fs: process.env.STORAGE_PATH,
      tempFs: process.env.STORAGE_TEMP_PATH,
    },
    tokenUserProperties: ["name", "email"],
  },
});
