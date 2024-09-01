import { GroupedRoutes } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";
const RouteService = new BaseApiService<GroupedRoutes>("routes");
export { RouteService };
