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
    } ,
    contentLink: {
      $type: String,
      default: null, // If it is not a file, set to null
      required: function () {
        return this.type === FolderType.File; // Required only if it's a file
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
      $type: {
        id: {
          $type: mongoose.Schema.Types.ObjectId,
          ref: ModelName.Folder,
        },
        path: {
          $type: String,
        }
      },
      default: null,
    },
    children: {
      $type:[mongoose.Schema.Types.ObjectId],
      ref: ModelName.Folder,
      default: null,
    },
    isRoot: {
      $type: Boolean,
      default:function () {
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
    path:{
    $type: String,
    default: function () {
      if (this.parent) {
        return this.parent.path + "/" + this._id;
      } else {
        return this._id;
      }
    }
    }
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

schema.methods.toJSON = function () {
  const obj = this.toObject();
  return {
    id: obj._id,
    ...obj,
  };
};

export default mongoose.model<TFolder>(ModelName.Folder, schema);
