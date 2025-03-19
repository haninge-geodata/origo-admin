import { createLayerService } from "@/utils/layerServiceFactory";
import { Request, Response } from "express";

class LayerController {
  async getById(req: Request, res: Response) {
    try {
      const service = createLayerService(req.params.type);
      const item = await service.find(req.params.id);
      res.status(200).json(item);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getByName(req: Request, res: Response) {
    try {
      const service = createLayerService("all");
      const items = await service.getByName(req.params.name);
      res.status(200).json(items);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const service = createLayerService(req.params.type);
      const items = await service.findAll();
      res.status(200).json(items);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const service = createLayerService(req.params.type);
      const item = await service.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const service = createLayerService(req.params.type);
      const item = await service.update(req.params.id, req.body);
      res.status(200).json(item);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async duplicate(req: Request, res: Response) {
    try {
      const service = createLayerService(req.params.type);
      const item = await service.duplicate(req.params.id);
      res.status(201).json(item);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteById(req: Request, res: Response) {
    try {
      const service = createLayerService(req.params.type);
      const item = await service.delete(req.params.id);
      res.status(200).json(item);
    } catch (error) {
      this.handleError(res, error);
    }
  }
  protected handleError(res: Response, error: any) {
    if (error instanceof Error) {
      console.error(`[${new Date().toISOString()}] ${error}`);
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Ett oväntat fel inträffade" });
    }
  }
}

const layerController = new LayerController();
export { layerController };
