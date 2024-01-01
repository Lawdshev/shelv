import { validateAccess, getPermissions } from "../../middleware/authenticate";
import { IFolder, IUser } from "../../types/user/user";
import * as response from "../../helpers/response";
import * as model from "../../model";
import { logger } from "../../log/logger";
import { GraphResponse } from "../../types/misc/graphql";
import validate from "../../validator/validate";
import * as folderValidator from "../../validator/folder";
import { IFolderRename } from "../../types/folder/folder";

export const createFolder = async (
  _: unknown,
  data: { input: IFolder },
  context: any
) => {
  try {
    const access = validateAccess(context.user as IUser);
    if (!access.status) {
      return response.sendErrorResponse(access.message, 401);
    }

    logger.debug(
      `start call to validate create folder with payload ${JSON.stringify(
        data.input
      )} for user :: ${context.user?.email}`
    );

    const validation = validate(folderValidator.createFolder, data.input);
    if (!validation.status) {
      return response.sendErrorResponse(validation.message, 400);
    }

    //logging process
    logger.debug(
      `start call to create folder with payload ${JSON.stringify(
        data.input
      )} for user ${context.user?.email} `
    );

    //check if folder exists
    const exists = await model.folder.exists({
      name: data.input.name.toLowerCase(),
    });
    if (exists) {
      return response.sendErrorResponse("folder already exists", 400);
    }

    //check parent access for sub folder creation
    if (data?.input?.parent?.id) {
      // check  if the parent is in th db
      const parent = await model.folder.findById(data?.input?.parent?.id);
      if (!parent) {
        return response.sendErrorResponse("parent not found", 404);
      }

      const permission = await getPermissions(
        context.user as IUser,
        data?.input?.parent?.id.toString() as string
      );

      if (
        !permission.status ||
        !permission.permission.write ||
        !permission.permission.admin
      ) {
        return response.sendErrorResponse(permission.message, 403);
      }
    }

    //create folder in db
    const newFolder = new model.folder({
      ...data.input,
      createdBy: context.user?._id,
      isRoot: data.input.parent ? false : true,
      parent: data.input.parent ? data.input.parent : null,
    });
    await newFolder.save();

    //push id of new folder to parent.children
    if (data.input.parent) {
      await model.folder.findByIdAndUpdate(data.input.parent.id, {
        $push: { children: newFolder._id },
      });
    }

    logger.debug(
      `end call to create folder with payload ${JSON.stringify(
        data.input
      )}, created folder ${JSON.stringify(newFolder)}`
    );

    return response.sendSuccessResponse(
      GraphResponse.RespondWithFolder,
      "folder created successfully",
      { ...newFolder.toJSON() }
    );
  } catch (error: any) {
    logger.error(`error while creating folder :: ${error.message}`);
    return response.sendErrorResponse(error.message, 500);
  }
};

export const renameFolder = async (
  _: unknown,
  data: { input: IFolderRename },
  context: any
) => {
    try {
      logger.debug(`start call to rename folder with payload ${JSON.stringify(data)} for user :: ${context.user?.email}`);
    

    // Validate user access
    const access = validateAccess(context.user as IUser);
    if (!access.status) {
      return response.sendErrorResponse(access.message, 401);
    }

    // Validate input
    const validation = validate(folderValidator.renameFolder, data.input);
    if (!validation.status) {
      return response.sendErrorResponse(validation.message, 400);
    }

    // Check if folder exists
    const folder = await model.folder.findById(data.input.id);
    if (!folder) {
      return response.sendErrorResponse("Folder not found", 404);
    }

    // Check user's permission to rename the folder
    const permission = await getPermissions(
      context.user as IUser,
      data.input.id
    );
    if (
      !permission.status ||
      !permission.permission.write ||
      !permission.permission.admin
    ) {
      return response.sendErrorResponse(permission.message, 403);
    }

    // Rename the folder
    folder.name = data.input.newName;
    folder.updatedAt = new Date();
    await folder.save();

    logger.debug(`Folder renamed successfully: ${JSON.stringify(folder.name)}`);

    return response.sendSuccessResponse(
      GraphResponse.RespondWithFolder,
      "Folder renamed successfully",
      { ...folder.toJSON() }
    );
  } catch (error: any) {
    logger.error(`Error while renaming folder: ${error.message}`);
    return response.sendErrorResponse(error.message, 500);
  }
};
