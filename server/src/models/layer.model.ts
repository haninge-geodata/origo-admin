import mongoose, { Schema } from "mongoose";
import mongodb from "mongodb";
import { DBLinkResource } from "./linkResource.model";
import { DBStyleSchema } from "./styleSchema.model";

interface KeyValuePair {
  key: string;
  value: string;
}

interface DBLayerBase extends mongoose.Document {
  _id: mongodb.ObjectId;
  name: string;
  title: string;
  abstract?: string;
  queryable: boolean;
  type: string;
  visible: boolean;
  attribution?: string;
  style?: mongodb.ObjectId | DBStyleSchema;
  extendedAttributes?: KeyValuePair[] | null;
}

interface DBLayerOWS extends DBLayerBase {
  layer_id?: string;
  source: mongodb.ObjectId | DBLinkResource;
}

const keyValuePairSchema = new Schema<KeyValuePair>(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const layerBaseSchema = new Schema<DBLayerBase>(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    abstract: { type: String },
    queryable: { type: Boolean, required: true },
    type: { type: String, required: true },
    visible: { type: Boolean, required: true },
    attribution: { type: String },
    style: { type: Schema.Types.ObjectId, ref: "StyleSchema" },
    extendedAttributes: {
      type: [keyValuePairSchema],
      default: null,
      validate: {
        validator: function (value: any) {
          if (value === null) return true;
          if (!Array.isArray(value)) return false;
          if (value.length === 0) return true;
          return value.every(
            (item) =>
              item &&
              typeof item.key === "string" &&
              typeof item.value === "string"
          );
        },
        message:
          "extendedAttributes must be null, an empty array, or an array of valid key-value pairs",
      },
    },
  },
  { discriminatorKey: "type" }
);

layerBaseSchema.pre("findOne", function () {
  this.populate("style");
});

layerBaseSchema.pre("find", function () {
  this.populate("style");
});

const layerModel = mongoose.model<DBLayerBase>("Layers", layerBaseSchema);

interface DBWFSLayer extends DBLayerOWS {
  geometryName: string;
  attributes?: any;
  opacity?: number;
  clusterStyle?: mongodb.ObjectId | DBStyleSchema;
  clusterOptions?: any;
}

const wfsLayerSchema = new Schema({
  layer_id: { type: String, required: false },
  source: { type: Schema.Types.ObjectId, ref: "LinkResource" },
  geometryName: { type: String, required: true },
  attributes: { type: Schema.Types.Mixed },
  opacity: { type: Number },
  clusterStyle: { type: Schema.Types.ObjectId, ref: "StyleSchema" },
  clusterOptions: { type: Schema.Types.Mixed },
});

wfsLayerSchema.pre("findOne", function () {
  this.populate("source");
  this.populate("clusterStyle");
});

wfsLayerSchema.pre("find", function () {
  this.populate("source");
  this.populate("clusterStyle");
});

const WFSLayerModel = layerModel.discriminator<DBWFSLayer>(
  "WFS",
  wfsLayerSchema
);

interface DBWMSLayer extends DBLayerOWS {
  geometryName: string;
  featureinfoLayer?: string;
  attributes?: Object;
  format: string;
  renderMode: string;
}

const wmsLayerSchema = new Schema({
  layer_id: { type: String, required: false },
  source: { type: Schema.Types.ObjectId, ref: "LinkResource" },
  geometryName: { type: String, required: true },
  attributes: { type: Object, required: false },
  format: { type: String, required: true },
  renderMode: { type: String, required: true },
  featureinfoLayer: { type: String, required: false },
});

wmsLayerSchema.pre("findOne", function () {
  this.populate("source");
});

wmsLayerSchema.pre("find", function () {
  this.populate("source");
});

const WMSLayerModel = layerModel.discriminator<DBWMSLayer>(
  "WMS",
  wmsLayerSchema
);

interface DBWMTSLayer extends DBLayerOWS {
  format: string;
  maxScale?: number;
  featureinfoLayer?: string;
}

const wmtsLayerSchema = new Schema({
  layer_id: { type: String, required: false },
  source: { type: Schema.Types.ObjectId, ref: "LinkResource" },
  format: { type: String, required: true },
  maxScale: { type: Number, required: false },
  featureinfoLayer: { type: String, required: false },
});

wmtsLayerSchema.pre("findOne", function () {
  this.populate("source");
});

wmtsLayerSchema.pre("find", function () {
  this.populate("source");
});

const WMTSLayerModel = layerModel.discriminator<DBWMTSLayer>(
  "WMTS",
  wmtsLayerSchema
);

type DBLayer = DBWFSLayer | DBWMSLayer | DBWMTSLayer | DBGroupLayer;

interface DBGroupLayer extends DBLayerBase {
  layers: (mongodb.ObjectId | DBLayer)[];
}

const groupLayerSchema = new Schema({
  layers: [{ type: Schema.Types.ObjectId, required: true, ref: "Layers" }],
});

groupLayerSchema.pre("findOne", function () {
  console.log("pre findOne");

  const populateOptions = {
    path: "layers",
    populate: [{ path: "style" }, { path: "source" }, { path: "clusterStyle" }],
  };

  this.populate(populateOptions);
});

groupLayerSchema.pre("find", function () {
  console.log("pre find");
  const populateOptions = {
    path: "layers",
    populate: [{ path: "style" }, { path: "source" }, { path: "clusterStyle" }],
  };

  this.populate(populateOptions);
});

const GroupLayerModel = layerModel.discriminator<DBGroupLayer>(
  "GROUP",
  groupLayerSchema
);

export interface Layer {
  id: string;
  name: string;
  description?: string;
  visible: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  // ... other existing properties
}

export {
  DBLayerBase,
  DBLayerOWS,
  layerModel,
  DBWFSLayer,
  WFSLayerModel,
  DBWMSLayer,
  WMSLayerModel,
  DBWMTSLayer,
  WMTSLayerModel,
  DBGroupLayer,
  GroupLayerModel,
};
