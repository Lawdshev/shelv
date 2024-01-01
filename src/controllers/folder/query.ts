import { validateAccess, getPermissions } from "../../middleware/authenticate";
import { IContext } from "../../types/misc/generic";
import { IUser } from "../../types/user/user";

import * as response from "../../helpers/response";
import * as models from "../../model";

import { logger } from "../../log/logger";
import { GraphResponse } from "../../types/misc/graphql";

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
    if (!folder) {
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
