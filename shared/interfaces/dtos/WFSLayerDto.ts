import { OWSLayerDto, StyleSchemaDto } from ".";

export interface WFSLayerDto extends OWSLayerDto {
  geometryName: string;
  attributes?: Record<string, any> | null;
  opacity?: number;
  clusterStyle?: StyleSchemaDto;
  clusterOptions?: Record<string, any> | null;
}
