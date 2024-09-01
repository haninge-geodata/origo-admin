import { ShareMapService } from "../services";
import { BaseController } from "./BaseController";
import { Request, Response } from "express";

class ExtendedShareMapController extends BaseController<ShareMapService> {
  constructor(service: ShareMapService) {
    super(service);
  }
  async getByUser(req: Request, res: Response): Promise<void> {
    try {
      const user = req.params.user;
      const items = await (this.service as any).getByUser(user);
      res.status(200).json(items);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

const shareMapService = new ShareMapService();
const shareMapController = new ExtendedShareMapController(shareMapService);
export { shareMapController };
