import { BaseController } from "./BaseController";
import { MapInstanceService } from "../services";
import { Request, Response } from "express";
import { PublishedMapDto } from "@/shared/interfaces/dtos";

class ExtendedMapInstanceController extends BaseController<MapInstanceService> {
  constructor(service: MapInstanceService) {
    super(service);
  }

  async getPreview(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const preview = await (this.service as any).getPreview(id);
      res.json(preview);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getLatestPublished(req: Request, res: Response): Promise<void> {
    try {
      const name = req.params.name;
      const published = await (this.service as any).getLatestPublished(name);
      res.json(published);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getPublished(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const published = await (this.service as any).getPublished(id);
      res.json(published);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getPublishedList(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const list = await (this.service as any).getPublishedList(id);
      res.json(list);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async publish(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const publishedMap = (await (this.service as any).publish(id)) as PublishedMapDto;
      res.json(publishedMap);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async republish(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const instanceId = req.params.instanceId;
      const publishedMap = (await (this.service as any).republish(id, instanceId)) as PublishedMapDto;
      res.json(publishedMap);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async syncLayer(req: Request, res: Response): Promise<void> {
    try {
      const layerId = req.params.id;
      const instanceIds = req.body.mapInstances;
      const actions = req.body.actions;
      const type = req.params.type;
      await (this.service as any).syncLayer(instanceIds, type, layerId, actions);
      res.json({ success: true });
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

const mapInstanceService = new MapInstanceService();
const mapInstanceController = new ExtendedMapInstanceController(mapInstanceService);

export { mapInstanceController };
