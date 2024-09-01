import { Request, Response } from "express";
import { RelationService } from "@/services";

class RelationController {
  private service;
  constructor() {
    this.service = new RelationService();
  }

  async getRelated(req: Request, res: Response) {
    try {
      const items = await this.service.findRelated(req.params.in, req.params.id, req.params.path);
      res.status(200).json(items);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private handleError(res: Response, error: any) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Ett oväntat fel inträffade" });
    }
  }
}

const relationController = new RelationController();
export { relationController as RelationController };
