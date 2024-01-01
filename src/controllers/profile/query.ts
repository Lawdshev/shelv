import { validateAccess } from "../../middleware/authenticate";
import { IContext } from "../../types/misc/generic";
import * as response from "../../helpers/response";
import * as model from "../../model";
import { logger } from "../../log/logger";
import { IUser } from "../../types/user/user";
import { GraphResponse } from "../../types/misc/graphql";

export const getUser = async (_: unknown, data: {}, context: IContext) => {
  try {
    const access = validateAccess(context.user as IUser);
    if (!access.status) {
      return response.sendErrorResponse(access.message, 400);
    }

    logger.debug(`start call to get user with email :: ${context.user?.email}`);

    if (!context.user) {
      return response.sendErrorResponse("unauthorized", 401);
    }

    const user = await model.user.findById(context.user._id);
    if (!user) {
      return response.sendErrorResponse("user not found", 404);
    }

    logger.debug(`end call to get user with email :: ${context.user?.email}`);

    return response.sendSuccessResponse(
      GraphResponse.RespondWithUser,
      "user details retrieved successfully",
      { ...user.toJSON() }
    );
  } catch (error: any) {
    logger.error(`error while getting user :: ${error.message}`);
    response.sendErrorResponse(error.message, 500);
  }
};
