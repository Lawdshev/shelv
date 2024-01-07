import { validateAccess, getPermissions } from "../../middleware/authenticate";
import { IFolder, IUser } from "../../types/user/user";
import * as response from "../../helpers/response";
import * as model from "../../model";
import { logger } from "../../log/logger";
import { GraphResponse } from "../../types/misc/graphql";
import validate from "../../validator/validate";
import * as folderValidator from "../../validator/folder";
import { IRevokeAccess, IShareFolder } from "../../types/folder/folder";
import { IContext } from "../../types/misc/generic";
import { permissionType } from "../../types/folder/enum";

// share access function
export const shareAccess = async (
  _: unknown,
  data: {
    input: IShareFolder;
  },
  context: IContext
) => {
  const access = validateAccess(context.user as IUser);
  if (!access.status) {
    return response.sendErrorResponse(access.message, 401);
  }
  logger.debug(
    `start call to share folder with link :: ${JSON.stringify(
      data.input
    )} for user :: ${context.user?.email}`
  );

  try {
    const validateInput = validate(folderValidator.shareFolder, data.input);
    if (!validateInput.status) {
      return response.sendErrorResponse(validateInput.message, 400);
    }

    const folder = await model.folder.findById(data.input.id);
    if (!folder) {
      return response.sendErrorResponse("Folder not found", 404);
    }

    const permission = await getPermissions(
      context.user as IUser,
      data.input.id
    );
    if (!permission.status || !permission.permission.admin) {
      return response.sendErrorResponse(permission.message, 403);
    }

    if (data.input.type === permissionType.AccessByLink) {
      const permissionsArray = [];

      // Check the data.input.permissions object and collect true permissions as strings
      if (data.input.permissions.read) {
        permissionsArray.push("read");
      }
      if (data.input.permissions.write) {
        permissionsArray.push("write");
      }

      await model.folder.updateOne(
        { _id: data.input.id },
        {
          $set: {
            accessByLink: {
              access: true,
              permissions: permissionsArray,
            },
          },
        }
      );
      return response.sendSuccessResponse(
        GraphResponse.Respond,
        `Folder ${data.input.id} shared successfully`,
        {}
      );
    }

    if (data.input.type === permissionType.SharedWithUser) {
      // Check if the user has an existing permission, if yes, update, else create
      const permissionsArray = [];

      // Check each permission and add to the array if it's true
      if (data.input.permissions.read) {
        permissionsArray.push("read");
      }
      if (data.input.permissions.write) {
        permissionsArray.push("write");
      }
      if (data.input.permissions.admin) {
        permissionsArray.push("admin");
      }

      const existingPermission = folder.sharedWith.find(
        (p) => p.user.toString() === data.input.userId
      );

      if (existingPermission) {
        // Update the existing permission
        await model.folder.updateOne(
          { _id: data.input.id, "sharedWith.user": data.input.userId },
          {
            $set: {
              "sharedWith.$.permissions": permissionsArray,
            },
          }
        );
        return response.sendSuccessResponse(
          GraphResponse.Respond,
          `Folder ${data.input.id} shared successfully`,
          {}
        );
      } else {
        // Create a new permission
        await model.folder.updateOne(
          { _id: data.input.id },
          {
            $push: {
              sharedWith: {
                user: data.input.userId,
                permissions: permissionsArray,
              },
            },
          }
        );
      }

      return response.sendSuccessResponse(
        GraphResponse.Respond,
        `Folder ${data.input.id} shared successfully`,
        {}
      );
    }
    response.sendErrorResponse("Invalid permission type provided", 400);
  } catch (error: any) {
    logger.error(`error while sharing folder ::: ${error.message}`);
    return response.sendErrorResponse(error.message, 500);
  }
};

//revoke access function
export const revokeAccess = async(
  _: unknown,
  data: {
    input: IRevokeAccess;
  },
  context: IContext
)=>{
  const access = validateAccess(context.user as IUser);
  if (!access.status) {
    return response.sendErrorResponse(access.message, 401);
  }
  logger.debug(
    `start call to revoke access with payload :: ${JSON.stringify(
      data.input
    )} for user :: ${context.user?.email}`
  );

  try {
      const validateInput = validate(folderValidator.revokeAccess, data.input);
      if (!validateInput.status) {
        return response.sendErrorResponse(validateInput.message, 400);
      }
    
    const folder = await model.folder.findOne({ _id: data.input.id });
    if (!folder) {
      return response.sendErrorResponse("Folder not found", 404);
    }

    if(data.input.type === permissionType.AccessByLink){
      await model.folder.updateOne(
        { _id: data.input.id },
        {
          $set: {
            accessByLink: {
              access: false,
              permissions: [],
            },
          },
        }
      );
      return response.sendSuccessResponse(
        GraphResponse.Respond,
        `Access revoked successfully in folder ${folder.name}`,
        {}
      );
    }

    const permission = folder.sharedWith.find(
      (shared) => shared.user.toString() === data.input.userId
    );
    if (!permission) {
      return response.sendErrorResponse("Permission not found", 404);
    }

    await model.folder.updateOne(
      { _id: data.input.id },
      {
        $pull: {
          sharedWith: { user: data.input.userId },
        },
      }
    );

    return response.sendSuccessResponse(
      GraphResponse.Respond,
      `Access revoked for user in folder ${data.input.id}`,
      {}
    );
  } catch (error: any) {
    logger.error(`Error while revoking access ::: ${error.message}`);
    return response.sendErrorResponse(error.message, 500);
  }
}
