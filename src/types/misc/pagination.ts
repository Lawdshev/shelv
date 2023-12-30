import mongoose from "mongoose";

export enum Pager {
  Sort = -1,
  Limit = 10,
  Offset = 0,
  Page = 1,
}

export interface IPage {
  limit?: number;
  offset?: number;
  sort?:
    | string
    | { [key: string]: mongoose.SortOrder | { $meta: "textScore" } };
}

export interface IPagination {
  page: number;
  limit: number;
  pages: number;
}
