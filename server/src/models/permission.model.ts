import mongoose, { Document, Schema, model } from "mongoose";

interface DBPermission {
  _id: mongoose.Types.ObjectId;
  type: string;
}

interface DBActor {
  name: string;
  type: string;
}

interface DBRole extends Document {
  _id: mongoose.Types.ObjectId;
  role: string;
  actors: DBActor[];
  permissions: DBPermission[];
}

const PermissionSchema = new Schema<DBPermission>({
  _id: { type: Schema.Types.ObjectId, required: true },
  type: { type: String, required: true },
});

const ActorSchema = new Schema<DBActor>({
  name: { type: String, required: true },
  type: { type: String, required: true },
});

const RoleSchema = new Schema<DBRole>({
  role: { type: String, required: true },
  actors: { type: [ActorSchema], required: true },
  permissions: { type: [PermissionSchema], required: true },
});

const RoleModel = model<DBRole>("Role", RoleSchema);
export { DBRole, DBPermission, DBActor, RoleModel };
