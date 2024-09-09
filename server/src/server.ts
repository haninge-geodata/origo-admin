import * as dotenv from "dotenv";
import path from "path";

console.info("Initializing environment...");
const environment = process.env.NODE_ENV || "local";
console.info(`Environment set to: ${environment}`);

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

console.info("Starting server...");

if (!process.env.PORT) {
  console.info(`No port value specified...`);
}

const PORT = parseInt(process.env.PORT as string, 10) || 8080;

console.info("Listening on port: ", PORT);
const app = express();

console.info("Initializing authentication...");

const BASE_PATH = process.env.BASE_PATH || "";
if (BASE_PATH) {
  console.info(`Using BASE_PATH=${BASE_PATH}`);
}

app.use(express.json());
app.use(bodyParser.json({ limit: "500mb" }));
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

console.info("Initializing database...");

if (!process.env.DATABASE) {
  console.info(`No database value specified...`);
}

initializeDatabase(process.env.DATABASE as string);
console.info("Database initialized...");

app.use(`${BASE_PATH}/api`, FavouritesRoutes);
app.use(`${BASE_PATH}/api`, LayerRoutes);
app.use(`${BASE_PATH}/api`, MapInstanceRoutes);
app.use(
  `${BASE_PATH}/uploads`,
  function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

app.use(`${BASE_PATH}/api`, LinkResourceRoutes);
app.use(`${BASE_PATH}/api`, MapControlRoutes);
app.use(`${BASE_PATH}/api`, MapSettingRoutes);
app.use(`${BASE_PATH}/api`, MediaRoutes);
app.use(`${BASE_PATH}/api`, StyleSchemaRoutes);
app.use(`${BASE_PATH}/api`, RelationRoutes);
app.use(`${BASE_PATH}/api`, PermissionRoutes);
app.use(`${BASE_PATH}/api`, ProxyRoutes);
app.use(`${BASE_PATH}/api`, AccessTokenRoutes);
app.use(`${BASE_PATH}/api`, RouteRoutes);
app.use(`${BASE_PATH}/api`, DashboardRoutes);

interface NodeError extends Error {
  code?: string;
}

console.info("Server started...");
app
  .listen(PORT, () => {
    console.info(`Server is listening on port ${PORT}`);
    swaggerDocs(app);
  })
  .on("error", (err: NodeError) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use.`);
    } else {
      console.error(err);
    }
  });
