import mongoose from "mongoose";
import { TFolder } from "../types/user/user";
import { ModelName } from "../types/misc/model";
import { FolderType } from "../types/user/enum";


const schema = new mongoose.Schema<TFolder>(
  {
    name: {
      $type: String,
      required: true,
      lowercase: true,
    },
    type: {
      $type: String,
      enum: FolderType,
      default: FolderType.Folder,
      uppercase: true,
      required: true,
    },
    contentLink: {
      $type: String,
      default: null,
      required: function () {
        return this.type === FolderType.File;
      },
    },
    createdAt: {
      $type: Date,
      default: Date.now,
    },
    updatedAt: {
      $type: Date,
      default: Date.now,
    },
    createdBy: {
      $type: mongoose.Schema.Types.ObjectId,
      ref: ModelName.User,
      required: true,
    },
    parent: {
      $type: mongoose.Schema.Types.ObjectId,
      default: undefined,
    },
    children: {
      $type: [mongoose.Schema.Types.ObjectId],
      ref: ModelName.Folder,
      default: undefined,
    },
    isRoot: {
      $type: Boolean,
      default: function () {
        return !!this.parent;
      },
    },
    sharedWith: {
      $type: [
        {
          user: {
            $type: mongoose.Schema.Types.ObjectId,
            ref: ModelName.User,
          },
          permissions: {
            $type: [String],
            enum: ["read", "write", "admin"],
            required: true,
          },
        },
      ],
    },
    accessByLink: {
      $type: {
        access: {
          $type: Boolean,
          default: false,
        },
        permissions: {
          $type: [String],
          enum: ["read", "write"],
          required: true,
        },
      },
      default: {
        access: false,
        permissions: ["read"],
      },
    },
    trash: {
      $type: Boolean,
      default: false,
    },
    deletedAt: {
      $type: Date,
      default: undefined,
      expires: "1m",
    },
  },
  {
    timestamps: true,
    typeKey: "$type",
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret._id;
      },
    },
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
      },
    },
  }
);

schema.index({ deletedAt: 1 }, { expireAfterSeconds: 0 }); // The 0 here is just a placeholder, as it will be replaced by the `expires` value in the field definition
// toJSON method to customize the output format
schema.methods.toJSON = function () {
  const obj = this.toObject();
  return {
    id: obj._id,
    ...obj,
  };
};


export default mongoose.model<TFolder>(ModelName.Folder, schema);
