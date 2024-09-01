import { BaseLayerDto, LinkResourceDto, StyleSchemaDto } from ".";

export interface WMSLayerDto extends BaseLayerDto {
  geometryName: string;
  featureinfoLayer?: string;
  attributes?: Record<string, any> | null;
  format: string;
  renderMode: string;
}
