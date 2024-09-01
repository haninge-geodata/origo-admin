import { StyleSchemaService } from "@/services";
import { BaseController } from "./BaseController";

const styleSchemaController = new BaseController(new StyleSchemaService());
export { styleSchemaController };
