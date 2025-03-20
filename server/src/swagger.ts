import { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { version } from "../package.json";
import fs from "fs";
import path from "path";

const BASE_PATH = process.env.BASE_PATH || undefined;
const SWAGGER_URL_SUFFIX = process.env.SWAGGER_URL_SUFFIX || undefined;
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3010;
const HOST = process.env.HOST || "localhost";

// Read the generated swagger.json file
const swaggerFile = path.join(__dirname, "swagger_output.json");
console.log(`[${new Date().toISOString()}] Reading swagger.json from ${swaggerFile}`);
let swaggerSpec: any;
try {
  const swaggerJson = fs.readFileSync(swaggerFile, "utf8");
  swaggerSpec = JSON.parse(swaggerJson);
} catch (err) {
  console.error(`[${new Date().toISOString()}] Error reading swagger.json: ${err}`);
  swaggerSpec = {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: version,
    },
    paths: {},
  };
}

// Add any additional info to the swagger spec
swaggerSpec.info.version = version;
swaggerSpec.components = swaggerSpec.components || {};
swaggerSpec.components.securitySchemes = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  },
};

swaggerSpec.servers = [
  {
    url: BASE_PATH ? BASE_PATH : "/api",
  },
];
swaggerSpec.security = [
  {
    bearerAuth: [],
  },
];

function swaggerDocs(app: Express) {
  const swaggerPath = BASE_PATH
    ? `/${BASE_PATH}/${SWAGGER_URL_SUFFIX}`.replace(/\/+/g, "/")
    : `/${SWAGGER_URL_SUFFIX}`;

  app.use(swaggerPath, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  const jsonDocsPath = BASE_PATH
    ? `/${BASE_PATH}/docs-json`.replace(/\/+/g, "/")
    : "/docs-json";
  app.get(jsonDocsPath, (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  let swaggerUrl: string;
  if (NODE_ENV === "production") {
    swaggerUrl = swaggerPath;
  } else {
    const protocol = NODE_ENV === "development" ? "http" : "https";
    swaggerUrl = `${protocol}://${HOST}:${PORT}${swaggerPath}`;
  }

  console.info(`[${new Date().toISOString()}] Swagger docs available at ${swaggerUrl}`);
}

export default swaggerDocs;
