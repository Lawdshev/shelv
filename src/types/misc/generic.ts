import { IUser } from "../user/user";
import { IPagination } from "./pagination";

export interface MakeResponse {
  status: number | boolean;
  message: string;
  data: Record<string, unknown>;
  pagination?: IPagination;
}

export interface IContext {
  user?: IUser;
  ip: string;
  referer: string;
  domain: string;
}

export type TPayload =
  | Record<string, unknown>
  | Record<string, any>
  | string
  | number
  | boolean;
