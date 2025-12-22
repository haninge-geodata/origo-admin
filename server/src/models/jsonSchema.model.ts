import mongoose, { Schema, Document } from "mongoose";

export interface DBJsonSchema extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  title: string;
  schemaContent: any;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jsonSchemaSchema = new Schema<DBJsonSchema>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    schemaContent: {
      type: Schema.Types.Mixed,
      required: true,
    },
    visible: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    collection: "jsonschemas",
  }
);

export const JsonSchemaModel = mongoose.model<DBJsonSchema>(
  "JsonSchema",
  jsonSchemaSchema
);
