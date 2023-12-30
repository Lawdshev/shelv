import mongoose from "mongoose";
import { AccountType } from "./enum";

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
}

export type TUser = mongoose.Document &
  IUser & {
    jsonify(): Record<string, any>;
  };
