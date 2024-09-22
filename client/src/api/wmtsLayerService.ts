import { WMTSLayerDto } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";
class WMTSLayerService extends BaseApiService<WMTSLayerDto> {
  constructor() {
    super("layers/wmts");
  }
  async duplicate(id: string): Promise<WMTSLayerDto> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).post<WMTSLayerDto>(`${this.resourcePath}/duplicate/${id}`);
      return response;
    });
  }
}

const wmtsLayerService = new WMTSLayerService();
export { wmtsLayerService as WMTSLayerService };
