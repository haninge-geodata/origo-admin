import * as dotenv from "dotenv";
import path from "path";

console.info(`[${Date.now()}] Initializing environment...`);
const environment = process.env.NODE_ENV || "local";

console.info(`[${Date.now()}] Environment set to: ${environment}`);

let envPath = "";
if (
  environment === "" ||
  environment === "local" ||
  environment === "development"
) {
  envPath = path.resolve(__dirname, "..", `.env`);
} else {
  envPath = path.resolve(__dirname, "..", `.env.${environment}`);
}

dotenv.config({ path: envPath });
const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER!;

import express from "express";
import * as bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import swaggerDocs from "./swagger";

import {
  LinkResourceRoutes,
  MapControlRoutes,
  MapSettingRoutes,
  MediaRoutes,
  StyleSchemaRoutes,
  MapInstanceRoutes,
  FavouritesRoutes,
  RelationRoutes,
  LayerRoutes,
  PermissionRoutes,
  ProxyRoutes,
  AccessTokenRoutes,
  RouteRoutes,
  DashboardRoutes,
} from "./routes";

import initializeDatabase from "./database";

console.info(`[${Date.now()}] Starting server...`);

if (!process.env.PORT) {
  console.info(`[${Date.now()}] No port value specified...`);
}

const PORT = parseInt(process.env.PORT as string, 10) || 8080;

console.info(`[${Date.now()}] Listening on port: ${PORT}`);
const app = express();

console.info(`[${Date.now()}] Initializing authentication...`);

const BASE_PATH = process.env.BASE_PATH || "";
if (BASE_PATH) {
  console.info(`[${Date.now()}] Using BASE_PATH=${BASE_PATH}`);
}
app.use(bodyParser.json({ limit: "500mb" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));

app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );
  res.setHeader("Expires", "0");
  res.setHeader("Pragma", "no-cache");
  next();
});

console.info(`[${Date.now()}] Initializing database...`);

if (!process.env.DATABASE) {
  console.info(`[${Date.now()}] No database value specified...`);
}

initializeDatabase(process.env.DATABASE as string);
console.info(`[${Date.now()}] Database initialized...`);

app.use(`${BASE_PATH}`, FavouritesRoutes);
app.use(`${BASE_PATH}`, LayerRoutes);
app.use(`${BASE_PATH}`, MapInstanceRoutes);
app.use(
  `${BASE_PATH}/uploads`,
  function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);
app.use(`${BASE_PATH}`, LinkResourceRoutes);
app.use(`${BASE_PATH}`, MapControlRoutes);
app.use(`${BASE_PATH}`, MapSettingRoutes);
app.use(`${BASE_PATH}`, MediaRoutes);
app.use(`${BASE_PATH}`, StyleSchemaRoutes);
app.use(`${BASE_PATH}`, RelationRoutes);
app.use(`${BASE_PATH}`, PermissionRoutes);
app.use(`${BASE_PATH}`, ProxyRoutes);
app.use(`${BASE_PATH}`, AccessTokenRoutes);
app.use(`${BASE_PATH}`, RouteRoutes);
app.use(`${BASE_PATH}`, DashboardRoutes);
app.use(`${BASE_PATH}/uploads`, express.static(path.resolve(UPLOAD_FOLDER)));

interface NodeError extends Error {
  code?: string;
}

console.info(`[${Date.now()}] Server started...`);
app
  .listen(PORT, () => {
    console.info(`[${Date.now()}] Server is listening on port ${PORT}`);
    swaggerDocs(app);
  })
  .on("error", (err: NodeError) => {
    if (err.code === "EADDRINUSE") {
      console.error(`[${Date.now()}] Port ${PORT} is already in use.`);
    } else {
      console.error(`[${Date.now()}] ${err}`);
    }
  });
