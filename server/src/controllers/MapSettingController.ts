import { MapSettingService } from "../services";
import { BaseController } from "./BaseController";

const mapSettingController = new BaseController(new MapSettingService());
export { mapSettingController };
