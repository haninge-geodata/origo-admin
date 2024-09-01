import { DashboardService } from "../services";
import { BaseController } from "./BaseController";

const dashboardController = new BaseController(new DashboardService());
export { dashboardController };
