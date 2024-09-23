import express from "express";
import dotenv from "dotenv";
import { CacheManager } from "./cacheManager";
import { ProxyManager } from "./proxyManager";

dotenv.config();

const app = express();
const port = process.env.PORT || 3020;
const resourcesEndpoint = process.env.RESOURCES_ENDPOINT_URL!;
const rolesEndpoint = process.env.ROLES_ENDPOINT_URL!;
const PROXY_BASE_PATH = process.env.PROXY_BASE_PATH || "proxy";
const API_ACCESS_TOKEN = process.env.API_ACCESS_TOKEN!;
const cacheManager = new CacheManager(
  rolesEndpoint,
  resourcesEndpoint,
  API_ACCESS_TOKEN
);
const proxyManager = new ProxyManager(
  cacheManager,
  API_ACCESS_TOKEN,
  PROXY_BASE_PATH
);

async function initializeServer() {
  try {
    await cacheManager.initializeCache();
    console.info("Cache initialized successfully");
  } catch (error) {
    console.error("Failed to initialize cache:", error);
    process.exit(1);
  }
}

app.use(proxyManager.getProxyMiddleware());

app.post("/admin/refresh-cache", async (req, res) => {
  try {
    await cacheManager.refreshCache();
    res.send("Cache refreshed successfully");
  } catch (error) {
    console.error("Error refreshing sources:", error);
    res.status(500).send("Error refreshing sources");
  }
});

app.get("/health", async (req, res) => {
  const healthStatus = await cacheManager.healthCheck();

  if (
    healthStatus.status === "healthy" ||
    healthStatus.status === "recovered"
  ) {
    res.status(200).json(healthStatus);
  } else {
    res.status(503).json(healthStatus);
  }
});

initializeServer().then(() => {
  app.listen(port, () => {
    console.info(`Proxy server running on port ${port}`);
  });
});
