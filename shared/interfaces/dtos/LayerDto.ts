import { WFSLayerDto } from "./WFSLayerDto";
import { WMSLayerDto } from "./WMSLayerDto";
import { WMTSLayerDto } from "./WMTSLayerDto";
import { DynamicLayerDto } from "./DynamicLayerDto";

export type LayerDto =
  | WFSLayerDto
  | WMSLayerDto
  | WMTSLayerDto
  | DynamicLayerDto;
