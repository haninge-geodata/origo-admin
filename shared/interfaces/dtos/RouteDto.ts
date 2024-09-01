export interface GroupedRoutes {
  route: string;
  routes: RouteInfo[];
}

export interface RouteInfo {
  path: string;
  method: string;
  permission: string;
}
