import { BaseLayerDto, LayerDto } from ".";

export interface GroupLayerDto extends BaseLayerDto {
  layers: LayerDto[];
}
