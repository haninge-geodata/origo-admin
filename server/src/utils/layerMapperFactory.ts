import { IMapper } from "@/interfaces";
import {
  LayerMapper,
  WFSLayerMapper,
  WMSLayerMapper,
  WMTSLayerMapper,
} from "@/mappers/layerMapper";
import { DynamicLayerMapper } from "@/mappers/dynamicLayerMapper";

function createLayerMapper(type: string): IMapper<any, any> {
  const upperType = type.toUpperCase();

  switch (upperType) {
    case "WFS":
      return new WFSLayerMapper();
    case "WMS":
      return new WMSLayerMapper();
    case "WMTS":
      return new WMTSLayerMapper();
    case "ALL":
      return new LayerMapper();
    default:
      return new DynamicLayerMapper();
  }
}

export { createLayerMapper };
