import mongoose from "mongoose";
import { AccountType, FolderType, Role } from "./enum";

export interface IUser {
  _id: mongoose.ObjectId;
  id: mongoose.ObjectId;

  firstName: string;
  lastName: string;
  email: string;
  password: string;
  type: AccountType;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  ownedFolders: mongoose.ObjectId[];
  sharedWithMe?: {
    folder: mongoose.ObjectId;
    permissions: string[];
  }
}

export interface IFolder {
  _id: mongoose.ObjectId;
  id: mongoose.ObjectId;
  name: string;
  type:FolderType.File | FolderType.Folder,
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.ObjectId;
  parent?: {id:mongoose.ObjectId, path:string} | null;
  children?: mongoose.ObjectId[] | null;
  isRoot: boolean;
  sharedWith: { user: mongoose.ObjectId; permissions: Role }[];
  accessByLink: { access: boolean; permissions: string[] };
  contentLink: String | null;
  path: String;
}


export type TFolder = mongoose.Document & IFolder & {
  jsonify(): Record<string, any>;
}

export type TUser = mongoose.Document &
  IUser & {
    jsonify(): Record<string, any>;
  };
