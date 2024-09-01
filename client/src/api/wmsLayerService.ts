import { WMSLayerDto } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";

class WMSLayerService extends BaseApiService<WMSLayerDto> {
  constructor() {
    super("layers/wms");
  }
  async duplicate(id: string): Promise<WMSLayerDto> {
    const response = (await this.getRestClient()).post<WMSLayerDto>(`${this.resourcePath}/duplicate/${id}`);
    return response;
  }
}

const wmsLayerService = new WMSLayerService();
export { wmsLayerService as WMSLayerService };
