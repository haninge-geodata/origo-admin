import { WFSLayerDto } from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";

class WFSLayerService extends BaseApiService<WFSLayerDto> {
  constructor() {
    super("layers/wfs");
  }
  async duplicate(id: string): Promise<WFSLayerDto> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).post<WFSLayerDto>(`${this.resourcePath}/duplicate/${id}`);
      return response;
    });
  }
}

const wmfsLayerService = new WFSLayerService();
export { wmfsLayerService as WFSLayerService };
