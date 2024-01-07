import { validateAccess, getPermissions } from "../../middleware/authenticate";
import { IContext } from "../../types/misc/generic";
import { IFolder, IUser } from "../../types/user/user";

import * as response from "../../helpers/response";
import * as models from "../../model";

import { logger } from "../../log/logger";
import { GraphResponse } from "../../types/misc/graphql";
import { IGetRootFolders } from "../../types/folder/folder";

import { buildQuery } from "../../helpers/queryAndSort";
import * as folderValidator from "../../validator/folder";
import validate from "../../validator/validate";
import mongoose from "mongoose";

export const getFolder = async (
  _: unknown,
  data: { id: string },
  context: IContext
) => {
  try {
    const access = validateAccess(context.user as IUser);
    if (!access.status) {
      return response.sendErrorResponse(access.message, 400);
    }

    if (!data.id) {
      return response.sendErrorResponse("folder id is required", 400);
    }

    logger.debug(`start call to get folder with id :: ${data.id}`);

    const permission = await getPermissions(context.user as IUser, data.id);
    if (!permission.status) {
      return response.sendErrorResponse(permission.message, 403);
    }

    const folder = await models.folder.findById(data.id);
    if (!folder || folder.trash) {
      return response.sendErrorResponse("folder not found", 404);
    }


    logger.debug(`end call to get folder with id :: ${data.id}`);
    return response.sendSuccessResponse(
      GraphResponse.RespondWithFolderAndPermissions,
      "folder details retrieved successfully",
      { folder:{...folder.toJSON()}, permissions: permission.permission }
    );
  } catch (error: any) {
    logger.error(`error while getting folder :: ${error.message}`);
    return response.sendErrorResponse(error.message, 500);
  }
};

export const getFolders = async (
  _: unknown,
  data: {
    input:IGetRootFolders
  },
  context: IContext
) => {
  try {
    const access = validateAccess(context.user as IUser);
    if (!access.status) {
      return response.sendErrorResponse(access.message, 400);
    }

    if (data.input) {
      const validation = validate(folderValidator.getRootFolders, data.input);
      if (!validation.status) {
        return response.sendErrorResponse(validation.message, 400);
      }  
    }

    logger.debug(
      `start call to get folders with payload ${JSON.stringify(
        data.input
      )} for user :: ${context.user?.email}`
    );

    const {
      query,sort,pagination
    } = buildQuery(data.input, context.user?._id as mongoose.Schema.Types.ObjectId);

    // Fetch total number of items without pagination
    const totalItems = await models.folder.countDocuments(query);

    // Fetch root folders from the database with pagination, sorting, and filtering
    let folders = await models.folder
      .find(query)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);

    // Calculate additional details
    const totalRemaining = totalItems - (pagination.skip + folders.length);
    const nextPage = totalRemaining > 0 ? pagination.page + 1 : null;

    return response.sendSuccessResponse(
      GraphResponse.RespondWithFoldersAndPageDetails,
      "Root folders retrieved successfully",
      {
        folders,
        pageDetails: {
          page: pagination.page,
          perPage: pagination.limit,
          ItemsCount: folders.length,
          totalItems,
          totalRemaining,
          nextPage,
        },
      }
    );
  } catch (error: any) {
    logger.error(`error while getting root folders :: ${error.message}`);
    return response.sendErrorResponse(error.message, 500);
  }
};
