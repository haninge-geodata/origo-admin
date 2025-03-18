// JsonProxyHandler.ts

import http, { IncomingMessage, ServerResponse } from "http";
import https from "https";
import { URL } from "url";
import path from "path";
import { CacheManager } from "../cacheManager";
import { extractTokenFromRequest } from "../lib/auth/auth";
import { UserInfoService } from "../lib/auth/userInforService";
import { FilterJsonService } from "../lib/jsonFilterService";

export type ProxyHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

export function createJsonProxyHandler(
  proxyBasePath: string,
  cacheManager: CacheManager,
  filterJsonService: FilterJsonService,
  apiAccessToken: string,
  userInfoService: UserInfoService,
  mapInstancesEndpointUrl: string
): ProxyHandler {
  return async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const proxyHost = process.env.HOST;
      const targetUrl = new URL(mapInstancesEndpointUrl);
      const originalUrl = new URL(req.url!, `http://${req.headers.host}`);

      let originalPathname = originalUrl.pathname;

      if (originalPathname.startsWith(proxyBasePath)) {
        originalPathname = originalPathname.slice(proxyBasePath.length);
      }

      originalPathname = path.posix.normalize(originalPathname);
      originalPathname = originalPathname.replace(/^\/+/, "");
      originalPathname = originalPathname.replace(/(\.json)+$/, ".json");

      const newPath = path.posix.join(targetUrl.pathname, originalPathname) + originalUrl.search;

      const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port || (targetUrl.protocol === "https:" ? 443 : 80),
        path: newPath,
        method: req.method,
        headers: {
          ...req.headers,
          host: targetUrl.host,
          Authorization: `Bearer ${apiAccessToken}`,
        },
      };

      const proxyReq = (targetUrl.protocol === "https:" ? https : http).request(options, (proxyRes) => {
        let body = "";
        proxyRes.on("data", (chunk) => {
          body += chunk;
        });

        proxyRes.on("end", async () => {
          try {
            const token = extractTokenFromRequest(req);
            if (token === null) {
              res.writeHead(401, { "Content-Type": "text/plain" });
              res.end("Unauthorized");
              return;
            }

            let userInfo;
            try {
              userInfo = await userInfoService.getUserInfo(token.value, token.expiresIn);
            } catch (error) {
              console.error(`[${Date.now()}] Error retrieving user info:`, error);
              res.writeHead(401, { "Content-Type": "text/plain" });
              res.end("Unauthorized");
              return;
            }

            let json;
            try {
              json = JSON.parse(body);
            } catch (e) {
              console.error(`[${Date.now()}] Error parsing JSON:`, e);
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Internal Server Error");
              return;
            }

            const protocol = targetUrl.protocol.startsWith("https") ? "https" : "http";
            const hostName = proxyHost || `${protocol}://${req.headers.host}`;
            const proxyBaseUrl = `${hostName}${proxyBasePath}`;

            let modifiedJson = await filterJsonService.filterJson(json, proxyBaseUrl, userInfo, cacheManager);
            const modifiedBody = JSON.stringify(modifiedJson);
            const headers = { ...proxyRes.headers };
            headers["content-type"] = "application/json";
            headers["content-length"] = Buffer.byteLength(modifiedBody).toString();

            res.writeHead(proxyRes.statusCode || 200, headers);
            res.end(modifiedBody);
          } catch (e) {
            console.error(`[${Date.now()}] Error processing response:`, e);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
          }
        });
      });

      proxyReq.on("error", (error) => {
        console.error(`[${Date.now()}] Proxy error:`, error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      });

      req.pipe(proxyReq);
    } catch (error) {
      console.error(`[${Date.now()}] Error in proxy handler:`, error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  };
}
