import { BaseLayerDto, StyleSchemaDto } from ".";

export interface WFSLayerDto extends BaseLayerDto {
  geometryName: string;
  attributes?: Record<string, any> | null;
  opacity?: number;
  clusterStyle?: StyleSchemaDto;
  clusterOptions?: Record<string, any> | null;
}
