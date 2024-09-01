import { ProxyService } from "@/services";
import { Request, Response } from "express";

class ProxyController {
  private service;
  constructor() {
    this.service = new ProxyService();
  }

  async getAllResources(req: Request, res: Response) {
    try {
      const items = await this.service.getAllResources();
      res.status(200).json(items);
    } catch (error) {
      this.handleError(res, error);
    }
  }
  async getAllRoles(req: Request, res: Response) {
    try {
      const items = await this.service.getAllRoles();
      res.status(200).json(items);
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

const proxyController = new ProxyController();
export { proxyController };
