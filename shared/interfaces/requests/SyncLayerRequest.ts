import { LayerDto } from "../dtos/LayerDto";
export interface SyncLayerRequest {
  mapInstances: string[];
  actions: string[];
}
