import mongoose from "mongoose";
import mongodb from "mongodb";
import { KeyValuePair } from "@/shared/interfaces/dtos";

interface DBLinkResource {
  _id: mongodb.ObjectId;
  name: string;
  title: string;
  url: string;
  type: string;
  extendedAttributes?: KeyValuePair[] | null;
}

const keyValuePairSchema = new mongoose.Schema<KeyValuePair>(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const linkResourceSchema = new mongoose.Schema<DBLinkResource>({
  name: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  extendedAttributes: {
    type: [keyValuePairSchema],
    default: null,
    validate: {
      validator: function (value: any) {
        if (value === null) return true;
        if (!Array.isArray(value)) return false;
        if (value.length === 0) return true;
        return value.every((item) => item && typeof item.key === "string" && typeof item.value === "string");
      },
      message: "extendedAttributes must be null, an empty array, or an array of valid key-value pairs",
    },
  },
});

const LinkResourceModel = mongoose.model<DBLinkResource>("LinkResource", linkResourceSchema);

export { DBLinkResource, LinkResourceModel, linkResourceSchema };
