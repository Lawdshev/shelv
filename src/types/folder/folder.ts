import mongoose from "mongoose";

export interface IFolderRename {
  newName: string;
  id: mongoose.ObjectId | string;
}
