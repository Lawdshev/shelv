import mongoose from "mongoose";
import * as func from "../helpers/func";
import { TUser } from "../types/user/user";
import { AccountType, Role } from "../types/user/enum";
import { ModelName } from "../types/misc/model";

const schema = new mongoose.Schema<TUser>(
  {
    email: {
      $type: String,
      required: true,
      lowercase: true,
      unique: true, // creates a unique index
    },
    password: {
      $type: String,
      required: true,
    },
    firstName: {
      $type: String,
      set: func.firstCharToUpperCase,
      required: true,
    },
    lastName: {
      $type: String,
      set: func.firstCharToUpperCase,
      required: true,
    },
    type: {
      $type: String,
      enum: AccountType,
      default: AccountType.Individual,
      uppercase: true,
      required: true,
    },
    emailVerified: {
      $type: Boolean,
      default: false,
    },
    ownedFolders: {
      $type: [
        {
          folder: {
            $type: mongoose.Schema.Types.ObjectId,
            ref: "Folder",
          },
        },
      ],
      default: [],
    },
    sharedWithMe: {
      $type: [
        {
          folder: {
            $type: mongoose.Schema.Types.ObjectId,
            ref: "Folder",
          },
          permissions: {
            $type: [String],
            enum: Role,
          },
        },
      ],
      default: [],
    }
  },
  {
    timestamps: true,
    typeKey: "$type",
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

/**
 * Returns a json object of the account
 * @param
 * @returns {Record<string, any>}
 *
 */
schema.methods.jsonify = function (): Record<string, any> {
  return {
    id: this._id,
    ...this.toJSON(),
  };
};

export default mongoose.model<TUser>(ModelName.User, schema);
