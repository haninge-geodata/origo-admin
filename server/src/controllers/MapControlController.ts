import { MapControlService } from "../services/";
import { BaseController } from "./BaseController";

const mapControlController = new BaseController(new MapControlService());
export { mapControlController };
