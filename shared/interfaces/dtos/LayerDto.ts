import { WFSLayerDto } from "./WFSLayerDto";
import { WMSLayerDto } from "./WMSLayerDto";
import { WMTSLayerDto } from "./WMTSLayerDto";
import { GroupLayerDto } from "./GroupLayerDto";

export type LayerDto = WFSLayerDto | WMSLayerDto | WMTSLayerDto | GroupLayerDto;
