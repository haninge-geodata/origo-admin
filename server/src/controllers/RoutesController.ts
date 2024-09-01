import { RouteRegistry } from "@/utils/routeUtils";
import { Request, Response } from "express";

class RoutesController {
  public getAvailableRoutes(req: Request, res: Response) {
    try {
      const routes = RouteRegistry.getAvailableRoutes();
      res.status(200).json(routes);
    } catch (error) {
      this.handleError(res, error);
    }
  }
  protected handleError(res: Response, error: any) {
    if (error instanceof Error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Ett oväntat fel inträffade" });
    }
  }
}

const routesController = new RoutesController();
export { routesController };
