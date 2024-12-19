import { KeyValuePair, StyleSchemaDto } from ".";

export interface BaseLayerDto {
  id: string;
  name: string;
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
