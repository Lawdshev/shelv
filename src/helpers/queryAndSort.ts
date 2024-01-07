import mongoose from "mongoose";
import {  IGetRootFolders } from "../types/folder/folder";

export const buildQuery = (
  input: IGetRootFolders,
  userId: string | mongoose.Schema.Types.ObjectId
) => {

  // Build the query object
  const query: any = {
    createdBy: userId,
    parent: input && input.id ? input.id : null,
    trash: false,
  };

  // Apply filter if provided
  if (input && input.filter) {
    query.name = { $regex: input.filter, $options: "i" };
    // $regex: input.filter will match substrings, $options: 'i' makes it case-insensitive
  }

  let sort: any = { createdAt: 1 }; // Default sorting by createdAt in ascending order
  if (input && input.sort) {
    sort = {}; // Clear default sorting
    const { field, order } = input.sort;
    sort[field] = order === "desc" ? -1 : 1;
  }

  const page =input && input.page ? input.page : 1;
  const perPage = input && input.perPage ? input.perPage : 20; // You can adjust the default value
  const skip = (page - 1) * perPage;

  const pagination = {
    skip,
    limit: perPage,
    sort,
    page,
  };

  return { query, sort, pagination };
};
