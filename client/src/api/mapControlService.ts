import { MapControlDto } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";
const MapControlService = new BaseApiService<MapControlDto>("mapcontrols");
export { MapControlService };
