import { IncomingMessage, ServerResponse } from "http";
import { URL } from "url";
import dotenv from "dotenv";
import { CacheManager } from "./cacheManager";
import { UserInfoService, userInfoService } from "./lib/auth/userInforService";
import { FilterJsonService } from "./lib/jsonFilterService";
import { createPassthroughProxyHandler } from "./handlers/passThroughProxyHandler";
import { createJsonProxyHandler } from "./handlers/jsonProxyHandler";

dotenv.config();

type ProxyHandler = (req: IncomingMessage, res: ServerResponse) => void;
export class ProxyManager {
  private proxyHandlers: { [key: string]: ProxyHandler };
  private proxyBasePath: string;
  private cacheManager: CacheManager;
  private filterJsonService: FilterJsonService;
  private userInfoService: UserInfoService;
  private apiAccessToken: string;
  private mapInstancesEndpointUrl: string;

  constructor(cacheManager: CacheManager, apiAccessToken: string, proxyBasePath: string = "proxy") {
    this.proxyBasePath = this.normalizeProxyBasePath(proxyBasePath);

    this.cacheManager = cacheManager;
    this.apiAccessToken = apiAccessToken;
    this.filterJsonService = new FilterJsonService();
    this.userInfoService = userInfoService;
    this.mapInstancesEndpointUrl = process.env.MAPINSTANCES_ENDPOINT_URL!;

    this.proxyHandlers = {};
    this.proxyHandlers[`${this.proxyBasePath}mapinstances/`] = createJsonProxyHandler(
      this.proxyBasePath,
      this.cacheManager,
      this.filterJsonService,
      this.apiAccessToken,
      this.userInfoService,
      this.mapInstancesEndpointUrl
    );
    this.proxyHandlers[`${this.proxyBasePath}gis/`] = createPassthroughProxyHandler(this.proxyBasePath, this.cacheManager, this.apiAccessToken, this.userInfoService);
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
