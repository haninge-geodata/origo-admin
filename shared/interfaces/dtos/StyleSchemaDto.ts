export interface StyleSchemaDto extends StyleSchemaBaseDto {
  styles: StyleItemDto[][];
}

export interface StyleSchemaBaseDto {
  id?: string;
  name: string;
}

export type StyleItemDto = IconStyleDto | CustomStyleDto;

export interface IconStyleDto extends BaseStyleItem {
  icon: IconDto;
  filter?: string;
  geometry?: string;
  header?: boolean;
  hidden?: boolean;
  extendedLegend?: boolean;
  background?: boolean;
}

export interface IconDto {
  size?: number[];
  src: string;
}

export enum StyleType {
  Icon = "Icon",
  Custom = "Custom",
}

export interface CustomStyleDto extends BaseStyleItem {
  style: object;
}

interface BaseStyleItem {
  label?: string;
  type: StyleType;
  id?: string;
}
