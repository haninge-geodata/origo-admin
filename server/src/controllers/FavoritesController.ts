import { FavoritesService } from "../services";
import { BaseController } from "./BaseController";
import { Request, Response } from "express";

class ExtendedFavoritesController extends BaseController<FavoritesService> {
  constructor(service: FavoritesService) {
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

const favoritesService = new FavoritesService();
const favoritesController = new ExtendedFavoritesController(favoritesService);
export { favoritesController };
