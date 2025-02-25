import { IMapper } from "@/interfaces";
import { LayerMapper, WFSLayerMapper, WMSLayerMapper, WMTSLayerMapper } from "@/mappers/layerMapper";

function createLayerMapper(type: string): IMapper<any, any> {
  switch (type.toUpperCase()) {
    case "WFS":
      return new WFSLayerMapper();
    case "WMS":
      return new WMSLayerMapper();
    case "WMTS":
      return new WMTSLayerMapper();
    case "ALL":
      return new LayerMapper();
    default:
      throw new Error(`No mapper available for type: ${type}`);
  }
}

export { createLayerMapper };
