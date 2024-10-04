import { Router, RequestHandler, IRouterMatcher } from "express";
import { checkPermission } from "@/middlewares/authMiddleware";
import { GroupedRoutes, RouteInfo } from "@/shared/interfaces/dtos";

type HttpMethod = "get" | "post" | "put" | "delete" | "patch";

export function createSecureRouter(baseRoute: string): Router {
  const router = Router();

  const methods: HttpMethod[] = ["get", "post", "put", "delete", "patch"];

  methods.forEach((method: HttpMethod) => {
    const originalMethod = router[method].bind(router) as IRouterMatcher<any>;
    (router[method] as any) = function (
      path: string,
      ...handlers: RequestHandler[]
    ) {
      const fullPath = `/${baseRoute}${path}`;
      const permission = `${method.toUpperCase()}:${fullPath}`;
      if (process.env.AUTH_ENABLED !== "false") {
        return originalMethod(path, checkPermission(permission), ...handlers);
      } else {
        return originalMethod(path, ...handlers);
      }
    };
  });

  return router;
}

export class RouteRegistry {
  private static routes: RouteInfo[] = [];

  static registerRoutes(router: Router, baseRoute: string) {
    router.stack.forEach((layer: any) => {
      if (layer.route) {
        const path = `/${baseRoute}${layer.route.path}`;
        const methods = Object.keys(layer.route.methods);

        methods.forEach((method) => {
          const permission = `${method.toUpperCase()}:${path}`;
          this.routes.push({ path, method: method.toUpperCase(), permission });
        });
      }
    });
  }
  static getAllRoutes(): RouteInfo[] {
    return this.routes;
  }

  static getGroupedRoutes(): GroupedRoutes[] {
    const groupedRoutes: { [key: string]: RouteInfo[] } = {};

    this.routes.forEach((route) => {
      const primaryRoute = route.path.split("/")[1]; // Get the first part of the path after '/'
      if (!groupedRoutes[primaryRoute]) {
        groupedRoutes[primaryRoute] = [];
      }
      groupedRoutes[primaryRoute].push(route);
    });

    const mapped = Object.entries(groupedRoutes).map(([route, routes]) => ({
      route,
      routes,
    }));
    return mapped;
  }

  static getAvailableRoutes() {
    const groupedRoutes = RouteRegistry.getGroupedRoutes();
    return groupedRoutes;
  }

  static getRoutesByBaseRoute(baseRoute: string): RouteInfo[] {
    return this.routes.filter((route) =>
      route.path.startsWith(`/${baseRoute}`)
    );
  }

  static clearRoutes() {
    this.routes = [];
  }

  static addCustomRoute(route: RouteInfo) {
    this.routes.push(route);
  }

  static removeRoute(path: string, method: string) {
    this.routes = this.routes.filter(
      (route) => !(route.path === path && route.method === method.toUpperCase())
    );
  }

  static updateRoutePermission(
    path: string,
    method: string,
    newPermission: string
  ) {
    const route = this.routes.find(
      (r) => r.path === path && r.method === method.toUpperCase()
    );
    if (route) {
      route.permission = newPermission;
    }
  }

  static getPermissionsForRoute(
    path: string,
    method: string
  ): string | undefined {
    const route = this.routes.find(
      (r) => r.path === path && r.method === method.toUpperCase()
    );
    return route?.permission;
  }
}
