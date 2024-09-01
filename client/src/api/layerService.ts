import { BaseLayerDto } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";
const LayerService = new BaseApiService<BaseLayerDto>("layers/all");
export { LayerService };
