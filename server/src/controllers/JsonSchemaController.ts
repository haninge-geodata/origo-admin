import { JsonSchemaService } from "@/services/jsonSchema.service";
import { BaseController } from "./BaseController";
import { Request, Response } from "express";

class ExtendedJsonSchemaController extends BaseController<JsonSchemaService> {
  constructor(service: JsonSchemaService) {
    super(service);
  }

  async getByName(req: Request, res: Response): Promise<void> {
    try {
      const name = req.params.name;
      const item = await (this.service as any).findByName(name);
      if (!item) {
        res.status(404).json({ error: `Schema with name "${name}" not found` });
        return;
      }
      res.status(200).json(item);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getVisible(req: Request, res: Response): Promise<void> {
    try {
      const items = await (this.service as any).findVisible();
      res.status(200).json(items);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getMenuItems(req: Request, res: Response): Promise<void> {
    try {
      const schemas = await (this.service as any).findVisible();

      const menuItems = schemas.map((schema: any, index: number) => ({
        id: 100 + index,
        name: schema.title,
        urlSegment: `/layers/${schema.name}`,
        type: "item",
        icon: "DataObject",
        schemaPath: schema.name,
        disabled: false,
      }));

      res.status(200).json(menuItems);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

const jsonSchemaService = new JsonSchemaService();
const jsonSchemaController = new ExtendedJsonSchemaController(
  jsonSchemaService
);

export { jsonSchemaController };
