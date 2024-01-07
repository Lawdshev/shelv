import mongoose from "mongoose";
import { permissionType } from "./enum";

export interface IFolderRename {
  newName: string;
  id: mongoose.ObjectId | string;
}

export interface IChangeFolderParent {
  id: mongoose.ObjectId | string;
  newParent?: mongoose.ObjectId | string;
}

export interface IShareFolder {
  id: mongoose.ObjectId | string;
  userId?: mongoose.ObjectId | string;
  permissions: {
    read: boolean;
    write: boolean;
    admin: boolean;
  };
  type: permissionType;
}

export interface IRevokeAccess {
  id: mongoose.ObjectId | string;
  userId?: mongoose.ObjectId | string;
  type: permissionType;
}

export interface IDeleteFolder {
  ids: mongoose.ObjectId[] | string[];
}
