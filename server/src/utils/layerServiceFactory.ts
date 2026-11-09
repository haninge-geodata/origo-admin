import {
  WFSLayerMapper,
  WMSLayerMapper,
  WMTSLayerMapper,
} from "@/mappers/layerMapper";
import {
  DBLayerBase,
  DBWFSLayer,
  DBWMSLayer,
  DBWMTSLayer,
  DBDynamicLayer,
  WFSLayerModel,
  WMSLayerModel,
  WMTSLayerModel,
  layerModel,
  dynamicLayerSchema,
} from "@/models/layer.model";
import { LayerService } from "@/services/layer.service";
import {
  WFSLayerDto,
  WMSLayerDto,
  WMTSLayerDto,
  DynamicLayerDto,
} from "@/shared/interfaces/dtos";
import { createLayerMapper } from "./layerMapperFactory";
import mongoose from "mongoose";

// Keep a cache to avoid re-registering dynamic discriminators per type
const dynamicModelCache = new Map<string, mongoose.Model<DBDynamicLayer>>();

// Returns a dynamic discriminator model for a layer type (case-insensitive).
// Registers the discriminator on first request, caches for future use.
function getDynamicLayerModel(type: string): mongoose.Model<DBDynamicLayer> {
  const upperType = type.toUpperCase();

  // Return cached model if already registered
  if (dynamicModelCache.has(upperType)) {
    return dynamicModelCache.get(upperType)!;
  }

  // Check if discriminator already exists on the model
  // Mongoose stores discriminators on the base model
  const existingDiscriminator = (layerModel as any).discriminators?.[upperType];
  if (existingDiscriminator) {
    dynamicModelCache.set(upperType, existingDiscriminator);
    return existingDiscriminator;
  }

  // Register new discriminator for this type
  try {
    const model = layerModel.discriminator<DBDynamicLayer>(
      upperType,
      dynamicLayerSchema
    );
    dynamicModelCache.set(upperType, model);
    return model;
  } catch (error) {
    // If discriminator already exists (race condition), retrieve it
    const discriminator = (layerModel as any).discriminators?.[upperType];
    if (discriminator) {
      dynamicModelCache.set(upperType, discriminator);
      return discriminator;
    }
    throw error;
  }
}

function createLayerService(type: string) {
  const mapper = createLayerMapper(type);
  const toDtoMethod = mapper.toDto.bind(mapper);
  const toDBModelMethod = mapper.toDBModel.bind(mapper);
  const upperType = type.toUpperCase();

  // Traditional layer types with specific models
  switch (upperType) {
    case "WFS":
      return new LayerService<DBWFSLayer, WFSLayerDto>(
        WFSLayerModel,
        toDtoMethod,
        toDBModelMethod
      );
    case "WMS":
      return new LayerService<DBWMSLayer, WMSLayerDto>(
        WMSLayerModel,
        toDtoMethod,
        toDBModelMethod
      );
    case "WMTS":
      return new LayerService<DBWMTSLayer, WMTSLayerDto>(
        WMTSLayerModel,
        toDtoMethod,
        toDBModelMethod
      );
    case "ALL":
      return new LayerService<
        DBLayerBase,
        WFSLayerDto | WMSLayerDto | WMTSLayerDto | DynamicLayerDto
      >(layerModel, toDtoMethod, toDBModelMethod);
    default:
      const dynamicModel = getDynamicLayerModel(type);
      return new LayerService<DBDynamicLayer, DynamicLayerDto>(
        dynamicModel,
        toDtoMethod,
        toDBModelMethod
      );
  }
}
export { createLayerService };
