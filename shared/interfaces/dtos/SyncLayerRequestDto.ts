import { LayerDto } from "./LayerDto";
export interface SyncLayerRequestDto {
  mapInstances: string[];
  type: string;
  layerId: string;
  actions: string[];
}
