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
  layer_id?: string;
  name: string;
  source: mongodb.ObjectId | DBLinkResource;
  title: string;
  abstract?: string;
  queryable: boolean;
  type: string;
  visible: boolean;
  attribution?: string;
  style?: mongodb.ObjectId | DBStyleSchema;
  extendedAttributes?: KeyValuePair[] | null;
}

const keyValuePairSchema = new mongoose.Schema<KeyValuePair>(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const layerBaseSchema = new mongoose.Schema<DBLayerBase>(
  {
    name: { type: String, required: true },
    layer_id: { type: String, required: false },
    source: { type: Schema.Types.ObjectId, ref: "LinkResource" },
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

const layerModel = mongoose.model<DBLayerBase>("Layers", layerBaseSchema);

interface DBWFSLayer extends DBLayerBase {
  geometryName: string;
  attributes?: any;
  opacity?: number;
  clusterStyle?: mongodb.ObjectId | DBStyleSchema;
  clusterOptions?: any;
}

const wfsLayerSchema = new Schema({
  geometryName: { type: String, required: true },
  attributes: { type: Schema.Types.Mixed },
  opacity: { type: Number },
  clusterStyle: { type: Schema.Types.ObjectId, ref: "StyleSchema" },
  clusterOptions: { type: Schema.Types.Mixed },
});

wfsLayerSchema.pre("findOne", function () {
  this.populate("clusterStyle");
  this.populate("source");
  this.populate("style");
});

wfsLayerSchema.pre("find", function () {
  this.populate("clusterStyle");
  this.populate("source");
  this.populate("style");
});

const WFSLayerModel = layerModel.discriminator<DBWFSLayer>(
  "WFS",
  wfsLayerSchema
);

interface DBWMSLayer extends DBLayerBase {
  geometryName: string;
  featureinfoLayer?: string;
  attributes?: Object;
  format: string;
  renderMode: string;
}

const wmsLayerSchema = new Schema({
  geometryName: { type: String, required: true },
  attributes: { type: Object, required: false },
  format: { type: String, required: true },
  renderMode: { type: String, required: true },
  featureinfoLayer: { type: String, required: false },
});

wmsLayerSchema.pre("findOne", function () {
  this.populate("source");
  this.populate("style");
});

wmsLayerSchema.pre("find", function () {
  this.populate("source");
  this.populate("style");
});

const WMSLayerModel = layerModel.discriminator<DBWMSLayer>(
  "WMS",
  wmsLayerSchema
);

interface DBWMTSLayer extends DBLayerBase {
  format: string;
  maxScale?: number;
  featureinfoLayer?: string;
}

const wmtsLayerSchema = new Schema({
  format: { type: String, required: true },
  maxScale: { type: Number, required: false },
  featureinfoLayer: { type: String, required: false },
});

wmtsLayerSchema.pre("findOne", function () {
  this.populate("source");
  this.populate("style");
});

wmtsLayerSchema.pre("find", function () {
  this.populate("source");
  this.populate("style");
});

const WMTSLayerModel = layerModel.discriminator<DBWMTSLayer>(
  "WMTS",
  wmtsLayerSchema
);

interface DBDynamicLayer extends DBLayerBase {
  dynamicProperties?: any;
}

const dynamicLayerSchema = new Schema({
  dynamicProperties: {
    type: Schema.Types.Mixed,
    required: false,
    default: null,
  },
  queryable: { type: Boolean, required: false },
  visible: { type: Boolean, required: false },
  source: { type: Schema.Types.Mixed, required: false },
  style: { type: Schema.Types.Mixed, required: false },
});

dynamicLayerSchema.post("find", async function (docs) {
  if (!Array.isArray(docs)) return;

  for (const doc of docs) {
    // Only populate if value is actually an ObjectId instance (not just a string)
    if (doc.source && doc.source instanceof mongoose.Types.ObjectId) {
      await doc.populate({ path: "source", model: "LinkResource" });
    }
    if (doc.style && doc.style instanceof mongoose.Types.ObjectId) {
      await doc.populate({ path: "style", model: "StyleSchema" });
    }
  }
});

dynamicLayerSchema.post("findOne", async function (doc) {
  if (!doc) return;

  if (doc.source && doc.source instanceof mongoose.Types.ObjectId) {
    await doc.populate({ path: "source", model: "LinkResource" });
  }
  if (doc.style && doc.style instanceof mongoose.Types.ObjectId) {
    await doc.populate({ path: "style", model: "StyleSchema" });
  }
});

export {
  DBLayerBase,
  layerModel,
  DBWFSLayer,
  WFSLayerModel,
  DBWMSLayer,
  WMSLayerModel,
  DBWMTSLayer,
  WMTSLayerModel,
  DBDynamicLayer,
  dynamicLayerSchema,
};
