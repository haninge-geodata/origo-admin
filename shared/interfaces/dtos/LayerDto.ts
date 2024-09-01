import { WFSLayerDto } from "./WFSLayerDto";
import { WMSLayerDto } from "./WMSLayerDto";
import { WMTSLayerDto } from "./WMTSLayerDto";

export type LayerDto = WFSLayerDto | WMSLayerDto | WMTSLayerDto;
