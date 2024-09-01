import { BaseLayerDto } from ".";

export interface WMTSLayerDto extends BaseLayerDto {
  format: string;
  maxScale?: number;
  featureinfoLayer?: string;
}
