import mongoose, { Schema } from "mongoose";
import mongodb from "mongodb";

interface DBStyleSchema extends DBBaseStyleSchema {
  styles: any[][];
}

interface DBBaseStyleSchema {
  _id: mongodb.ObjectId;
  name: string;
}
const styleSchema = new mongoose.Schema<DBStyleSchema>({
  name: { type: String, required: true },
  styles: { type: [[Schema.Types.Mixed]], required: false },
});
const baseStyleSchema = new mongoose.Schema<DBBaseStyleSchema>({
  name: { type: String, required: true },
});

const StyleSchemaModel = mongoose.model<DBStyleSchema>("StyleSchema", styleSchema);

export { DBStyleSchema, StyleSchemaModel, styleSchema, DBBaseStyleSchema, baseStyleSchema };
