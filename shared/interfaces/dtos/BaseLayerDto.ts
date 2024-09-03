import { KeyValuePair, LinkResourceDto, StyleSchemaDto } from ".";

export interface BaseLayerDto {
  id: string;
  layer_id?: string;
  name: string;
  source: LinkResourceDto;
  title: string;
  abstract: string;
  group?: string;
  queryable: boolean;
  type: string;
  visible: boolean;
  attribution: string;
  style?: StyleSchemaDto;
  extendedAttributes?: KeyValuePair[];
}
