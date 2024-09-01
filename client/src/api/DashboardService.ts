import { DashboardDto } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";
const DashboardService = new BaseApiService<DashboardDto>("dashboard");
export { DashboardService };
