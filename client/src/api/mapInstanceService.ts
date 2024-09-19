import {
  MapInstanceDto,
  MapInstanceListItemDto,
  PublishedMapBaseDto,
  PublishedMapConfigDto,
  PublishedMapDto,
  SyncLayerRequestDto
} from "@/shared/interfaces/dtos";
import { BaseApiService } from "./baseService";

class MapInstanceService extends BaseApiService<MapInstanceDto> {
  constructor() {
    super("mapInstances");
  }

  async fetchList(): Promise<MapInstanceListItemDto[]> {
    const restClient = await this.getRestClient();
    const response = await restClient.get<MapInstanceListItemDto[]>(`${this.resourcePath}`);
    return response;
  }

  async fetchPreview(id: string): Promise<PublishedMapConfigDto> {
    const restClient = await this.getRestClient();
    const response = await restClient.get<PublishedMapConfigDto>(`${this.resourcePath}/${id}/preview`);
    return response;
  }

  async fetchPublishedList(id: string): Promise<PublishedMapBaseDto[]> {
    const restClient = await this.getRestClient();
    const response = await restClient.get<PublishedMapBaseDto[]>(`${this.resourcePath}/${id}/published/list`);
    return response;
  }

  async publish(id: string): Promise<PublishedMapDto> {
    const restClient = await this.getRestClient();
    const response = await restClient.post<PublishedMapDto>(`${this.resourcePath}/${id}/publish`, {});
    return response;
  }
  async republish(id: string, instanceId: string): Promise<PublishedMapDto> {
    const restClient = await this.getRestClient();
    const response = await restClient.post<PublishedMapDto>(`${this.resourcePath}/${id}/republish/${instanceId}`, {});
    return response;
  }

  async syncLayer(req: SyncLayerRequestDto, type: string, layerId: string): Promise<boolean> {
    const restClient = await this.getRestClient();
    const response = await restClient.put<boolean>(`${this.resourcePath}/layer/${type}/${layerId}/sync/`, req);
    return response;
  }
}

const mapInstanceService = new MapInstanceService();
export { mapInstanceService as MapInstanceService };
