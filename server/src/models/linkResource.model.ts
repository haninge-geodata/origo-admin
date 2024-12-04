import mongoose from "mongoose";
import mongodb from "mongodb";
import { KeyValuePair } from "@/shared/interfaces/dtos";
import { LinkResourceAuthDto } from "@/shared/interfaces/dtos/LinkResourceAuthDto";

interface DBLinkResource {
  _id: mongodb.ObjectId;
  name: string;
  title: string;
  url: string;
  type: string;
  auth?: LinkResourceAuthDto;
  extendedAttributes?: KeyValuePair[] | null;
}

const keyValuePairSchema = new mongoose.Schema<KeyValuePair>(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const linkResourceAuthSchema = new mongoose.Schema<LinkResourceAuthDto>(
  {
    type: {
      type: String,
      required: true,
      enum: {
        values: ['basic', 'token', 'oauth-credentials'],
        message: '{VALUE} is not supported'
      }
    },
    username: { type: String, required: false },
    password: { type: String, required: false },
    tokenPrefix: { type: String, required: false },
    tokenString: { type: String, required: false },
    clientKey: { type: String, required: false },
    clientSecret: { type: String, required: false }
  },
  { _id: false }
);

const linkResourceSchema = new mongoose.Schema<DBLinkResource>({
  name: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  auth: {
    type: linkResourceAuthSchema,
    validate: {
      validator: function (value: any) {
        if (value === null) return true;

        const hasUsernameAndPassword = value.type === 'basic' && value.username !== undefined && value.password !== undefined;
        const hasPrefixAndToken = value.type === 'token' && value.tokenPrefix !== undefined && value.tokenString !== undefined;
        const hasKeyAndSecret = value.type === 'oauth-credentials' && value.clientKey !== undefined && value.clientSecret !== undefined;
        return (hasUsernameAndPassword || hasPrefixAndToken || hasKeyAndSecret);
      },
      message: "Must be null or have either type 'basic' with username and password or type 'token' with tokenPrefix and tokenString or type 'oauth-credentials' with client_key and client_secret."
    }
  },
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
  }
});

const LinkResourceModel = mongoose.model<DBLinkResource>("LinkResource", linkResourceSchema);

export { DBLinkResource, LinkResourceModel, linkResourceSchema };
