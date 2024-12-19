import { BaseLayerDto, LinkResourceDto } from ".";

export interface OWSLayerDto extends BaseLayerDto {
  layer_id?: string;
  source: LinkResourceDto;
}
