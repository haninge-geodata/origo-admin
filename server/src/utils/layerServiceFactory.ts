import { WFSLayerMapper, WMSLayerMapper, WMTSLayerMapper } from "@/mappers/layerMapper";
import {
  DBLayerBase,
  DBWFSLayer,
  DBWMSLayer,
  DBWMTSLayer,
  WFSLayerModel,
  WMSLayerModel,
  WMTSLayerModel,
  layerModel,
} from "@/models/layer.model";
import { LayerService } from "@/services/layer.service";
import { WFSLayerDto, WMSLayerDto, WMTSLayerDto } from "@/shared/interfaces/dtos";
import { createLayerMapper } from "./layerMapperFactory";

function createLayerService(type: string) {
  const mapper = createLayerMapper(type);
  const toDtoMethod = mapper.toDto.bind(mapper);
  const toDBModelMethod = mapper.toDBModel.bind(mapper);
  switch (type.toUpperCase()) {
    case "WFS":
      return new LayerService<DBWFSLayer, WFSLayerDto>(WFSLayerModel, toDtoMethod, toDBModelMethod);
    case "WMS":
      return new LayerService<DBWMSLayer, WMSLayerDto>(WMSLayerModel, toDtoMethod, toDBModelMethod);
    case "WMTS":
      return new LayerService<DBWMTSLayer, WMTSLayerDto>(WMTSLayerModel, toDtoMethod, toDBModelMethod);
    case "ALL":
      return new LayerService<DBLayerBase, WMTSLayerDto>(layerModel, toDtoMethod, toDBModelMethod);
    default:
      throw new Error("Unsupported layer type");
  }
}
export { createLayerService };
