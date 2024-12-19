import { OWSLayerDto } from ".";

export interface WMTSLayerDto extends OWSLayerDto {
  format: string;
  maxScale?: number;
  featureinfoLayer?: string;
}
