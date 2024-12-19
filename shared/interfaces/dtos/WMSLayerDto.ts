import { OWSLayerDto } from ".";

export interface WMSLayerDto extends OWSLayerDto {
  geometryName: string;
  featureinfoLayer?: string;
  attributes?: Record<string, any> | null;
  format: string;
  renderMode: string;
}
