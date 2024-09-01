import http, { IncomingMessage, ServerResponse } from "http";
import https from "https";
import { URL } from "url";
import dotenv from "dotenv";
import { CacheManager } from "./cacheManager";
import { GISRequestAnalyzer } from "./GISRequestAnalyzer";
import { extractGroups, extractTokenFromRequest } from "./auth";

dotenv.config();

const MAPINSTANCES_ENDPOINT_URL = process.env.MAPINSTANCES_ENDPOINT_URL!;
type ProxyHandler = (req: IncomingMessage, res: ServerResponse) => void;
const testPermissions = ["VA-Grupp", "GIS-GRUPP1", "My-User1"];

export class ProxyManager {
  private proxyHandlers: { [key: string]: ProxyHandler };
  private proxyBasePath: string;
  private cacheManager: CacheManager;
  private apiAccessToken: string;
  private readonly GIS_PATH = "gis";

  constructor(cacheManager: CacheManager, apiAccessToken: string, proxyBasePath: string = "proxy") {
    this.proxyBasePath = this.normalizeProxyBasePath(proxyBasePath);

    this.proxyHandlers = {};
    this.proxyHandlers[`${this.proxyBasePath}mapinstances/`] = this.createJsonProxyHandler();
    this.proxyHandlers[`${this.proxyBasePath}gis/`] = this.createPassthroughProxyHandler();

    this.cacheManager = cacheManager;
    this.apiAccessToken = apiAccessToken;
  }

  normalizeProxyBasePath(path: string): string {
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    if (!path.endsWith("/")) {
      path = path + "/";
    }
    return path;
  }

  private createJsonProxyHandler(): ProxyHandler {
    return (req: any, res: any) => {
      const targetUrl = new URL(MAPINSTANCES_ENDPOINT_URL);
      const originalUrl = new URL(req.url!, `http://${req.headers.host}`);

      const newPath = originalUrl.pathname.startsWith(this.proxyBasePath)
        ? targetUrl.pathname + "/" + originalUrl.pathname.slice(this.proxyBasePath.length) + originalUrl.search
        : targetUrl.pathname + originalUrl.pathname + originalUrl.search;

      const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port,
        path: newPath,
        method: req.method,
        headers: {
          ...req.headers,
          host: targetUrl.host,
          Authorization: `Bearer ${this.apiAccessToken}`,
        },
      };

      const proxyReq = (targetUrl.protocol === "https:" ? https : http).request(options, (proxyRes) => {
        let body = "";
        proxyRes.on("data", (chunk) => {
          body += chunk;
        });

        proxyRes.on("end", () => {
          try {
            const json = JSON.parse(body);
            let modifiedJson = this.modifyJson(json, req, res);
            const modifiedBody = JSON.stringify(modifiedJson);
            const headers = { ...proxyRes.headers };
            headers["content-type"] = "application/json";
            headers["content-length"] = Buffer.byteLength(modifiedBody).toString();

            res.writeHead(proxyRes.statusCode || 200, headers);
            res.end(modifiedBody);
          } catch (e) {
            console.error("Error parsing JSON:", e);
            res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
            res.end(body);
          }
        });
      });
      proxyReq.on("error", (error) => {
        console.error("Proxy error:", error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Proxy error");
      });

      req.pipe(proxyReq);
    };
  }
  createPassthroughProxyHandler(): ProxyHandler {
    return (req: IncomingMessage, res: ServerResponse) => {
      const proxyPath = req.url!.replace(new RegExp(`^${this.proxyBasePath}gis/`), "");

      const [sourcePath, query] = proxyPath.split("?");
      const [source, ...pathParts] = sourcePath.split("/");
      const path = pathParts.join("/");

      const sourceUrl = this.cacheManager.getSourceUrlByName(source);

      if (!sourceUrl) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Source not found");
        return;
      }

      let targetUrlString = `${sourceUrl}/${path}${query ? `?${query}` : ""}`;
      if (sourceUrl.includes("?")) {
        const [sourceBase, sourceQuery] = sourceUrl.split("?");
        targetUrlString = `${sourceBase}/${path}?${sourceQuery}${query ? `&${query}` : ""}`;
      } else {
        targetUrlString = `${sourceUrl}/${path}${query ? `?${query}` : ""}`;
      }

      targetUrlString = targetUrlString.replace(/([^:]\/)\/+/g, "$1");

      const targetUrl = new URL(targetUrlString);

      const { layerName, layers } = GISRequestAnalyzer.parseRequest(targetUrlString);

      let hasPermission = false;
      if (layers && layers.length > 0) {
        hasPermission = layers.every((layer) => this.cacheManager.hasLayerPermission(source, layer, testPermissions));
      } else if (layerName) {
        hasPermission = this.cacheManager.hasLayerPermission(source, layerName, testPermissions);
      }

      if (!hasPermission) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Forbidden: You don't have permission to access this resource");
        return;
      }

      const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port || (targetUrl.protocol === "https:" ? 443 : 80),
        path: targetUrl.pathname + targetUrl.search,
        method: req.method,
        headers: {
          ...req.headers,
          host: targetUrl.host,
          Authorization: `Bearer ${this.apiAccessToken}`,
        },
      };

      const proxyReq = (targetUrl.protocol === "https:" ? https : http).request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on("error", (error) => {
        console.error("Proxy error:", error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Proxy error");
      });

      req.pipe(proxyReq);
    };
  }

  getGroupsFromToken(req: IncomingMessage, res: ServerResponse): string[] {
    const token = extractTokenFromRequest(req);
    if (!token) {
      res.writeHead(401, { "Content-Type": "text/plain" });
      res.end("No token provided");
      return [];
    }

    const permissions = extractGroups(token);
    return permissions;
  }

  modifyJson(json: any, req: IncomingMessage, res: ServerResponse): any {
    const targetUrl = MAPINSTANCES_ENDPOINT_URL;
    const protocol = targetUrl.startsWith("https") ? "https" : "http";
    const proxyBaseUrl = `${protocol}://${req.headers.host}${this.proxyBasePath}`;

    if (json.source) {
      for (const key in json.source) {
        if (json.source[key].url) {
          const url = this.cacheManager.getSourceUrlByName(key);
          if (url) {
            json.source[key].url = `${proxyBaseUrl}gis/${key}`;
          }
        }
      }
    }
    const permissions = this.getGroupsFromToken(req, res);
    if (json.layers) {
      json.layers = json.layers.filter((layer: any) => {
        const p = permissions.some((p) => this.cacheManager.hasPermission(p, layer.id));
        return p;
      });
    }

    const remainingGroups = new Set(json.layers.map((layer: any) => layer.group));

    const filterGroups = (groups: any[]): any[] => {
      return groups.filter((group) => {
        if (group.groups) {
          group.groups = filterGroups(group.groups);
        }
        return remainingGroups.has(group.name) || (group.groups && group.groups.length > 0);
      });
    };

    if (json.groups) {
      json.groups = filterGroups(json.groups);
    }

    if (json.layers) {
      json.layers = json.layers.map((layer: any) => {
        const { id, origoId, ...rest } = layer;

        if (origoId !== null && origoId !== undefined && origoId !== "") {
          return { ...rest, Id: origoId };
        } else {
          return rest;
        }
      });
    }

    return json;
  }

  public getProxyMiddleware(): (req: IncomingMessage, res: ServerResponse, next: () => void) => void {
    return (req, res, next) => {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const handler = Object.entries(this.proxyHandlers).find(([path]) => url.pathname.startsWith(path));
      if (handler) {
        handler[1](req, res);
      } else {
        next();
      }
    };
  }

  public addHandler(path: string, handler: ProxyHandler): void {
    this.proxyHandlers[path] = handler;
  }
}
