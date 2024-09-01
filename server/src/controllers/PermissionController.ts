import { PermissionService } from "../services";
import { BaseController } from "./BaseController";
import { Request, Response } from "express";

class ExtendedPermissionController extends BaseController<PermissionService> {
  constructor(service: PermissionService) {
    super(service);
  }

  async duplicate(req: Request, res: Response) {
    try {
      const resp = await (this.service as any).duplicate(req.params.id);
      res.json(resp);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

const permissionController = new ExtendedPermissionController(new PermissionService());
export { permissionController };
