import { MapSettingDto } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";
const MapSettingService = new BaseApiService<MapSettingDto>("mapsettings");
export { MapSettingService };
