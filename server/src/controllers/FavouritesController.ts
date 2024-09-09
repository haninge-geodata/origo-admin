import { FavouritesService } from "../services";
import { BaseController } from "./BaseController";
import { Request, Response } from "express";

class ExtendedFavouritesController extends BaseController<FavouritesService> {
  constructor(service: FavouritesService) {
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

const favouritesService = new FavouritesService();
const favouritesController = new ExtendedFavouritesController(favouritesService);
export { favouritesController };
