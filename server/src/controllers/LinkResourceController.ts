import { LinkResourceService } from "../services/linkResource.service";
import { BaseController } from "./BaseController";
import { Request, Response } from "express";

class ExtendedLinkResourceController extends BaseController<LinkResourceService> {
  constructor(service: LinkResourceService) {
    super(service);
  }

  async getByName(req: Request, res: Response) {
    try {
      const resp = await (this.service as any).getByName(req.params.name);
      res.json(resp);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getByType(req: Request, res: Response) {
    try {
      const resp = await (this.service as any).findByType(req.params.type);
      res.json(resp);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

const linkResourceService = new LinkResourceService();
const linkResourceController = new ExtendedLinkResourceController(linkResourceService);

export { linkResourceController };
