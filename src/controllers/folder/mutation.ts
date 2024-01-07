import  mongoose  from 'mongoose';
import { validateAccess, getPermissions } from "../../middleware/authenticate";
import { IFolder, IUser } from "../../types/user/user";
import * as response from "../../helpers/response";
import * as model from "../../model";
import { logger } from "../../log/logger";
import { GraphResponse } from "../../types/misc/graphql";
import validate from "../../validator/validate";
import * as folderValidator from "../../validator/folder";
import { IChangeFolderParent, IDeleteFolder, IFolderRename } from "../../types/folder/folder";
import { IContext } from '../../types/misc/generic';
import markFoldersAsTrash from '../../helpers/recursiveDelete';

export const createFolder = async (
  _: unknown,
  data: { input: IFolder },
  context: IContext
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
    if (data?.input?.parent) {
      // check  if the parent is in th db
      const parent = await model.folder.findById(data?.input?.parent);
      if (!parent) {
        return response.sendErrorResponse("parent not found", 404);
      }

      const permission = await getPermissions(
        context.user as IUser,
        data?.input?.parent?.toString() as string
      );

      if (
        !permission.status ||
        !permission.permission.write ||
        !permission.permission.admin
      ) {
        return response.sendErrorResponse("permission denied", 403);
      }
    }

    //create folder in db
    const newFolder = new model.folder({
      ...data.input,
      createdBy: context.user?._id,
      isRoot: data.input.parent ? false : true,
      parent: data.input.parent ? data.input.parent : undefined,
      children: undefined,
    });
    await newFolder.save();

    //push id of new folder to parent.children
    if (data.input.parent) {
      await model.folder.findByIdAndUpdate(data.input.parent, {
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
  context: IContext
) => {
  try {
    logger.debug(
      `start call to rename folder with payload ${JSON.stringify(
        data
      )} for user :: ${context.user?.email}`
    );

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
    if (!folder || folder.trash) {
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
      return response.sendErrorResponse("Permission denied", 403);
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

export const changeParent = async (
  _: unknown,
  data: { input: IChangeFolderParent },
  context: IContext
) => {
  const access = validateAccess(context.user as IUser);
  if (!access.status) {
    return response.sendErrorResponse(access.message, 401);
  }

  logger.debug(
    `start call to change parent folder with payload ${JSON.stringify(
      data
    )} for user :: ${context.user?.email}`
  );

  try {
    const validation = validate(folderValidator.changeParent, data.input);
    if (!validation.status) {
      return response.sendErrorResponse(validation.message, 400);
    }

    const folder = await model.folder.findById(data.input.id);
    if (!folder || folder.trash) {
      return response.sendErrorResponse("Folder not found", 404);
    }

    // Check user's permission to change the parent of the folder
    const permission = await getPermissions(context.user as IUser, folder._id);
    if (
      !permission.status ||
      !permission.permission.write ||
      !permission.permission.admin
    ) {
      return response.sendErrorResponse("Permission denied for folder", 403);
    }

    if (data.input.newParent) {
       if (data.input.newParent === folder.parent) {
         return response.sendErrorResponse(
           "New parent is same as old parent",
           400
         );
       }
      if (folder.children) {
        if (folder.children.includes(data.input.newParent as mongoose.ObjectId )) {
          return response.sendErrorResponse(
            "Invalid folder destination, can not move folder to a child folder",
            400
          );
        }
      }
      const newParent = await model.folder.findById(data.input.newParent);
      if (!newParent) {
        return response.sendErrorResponse("Destination folder not found", 404);
      }
      const newParentPermission = await getPermissions(
        context.user as IUser,
        newParent._id
      );
      if (
        !newParentPermission.status ||
        !newParentPermission.permission.write ||
        !newParentPermission.permission.admin
      ) {
        return response.sendErrorResponse(
          "Permission denied for destination folder",
          403
        );
      }

      // Change the parent of the folder
      folder.parent = newParent._id;
      folder.isRoot = false;
      folder.updatedAt = new Date();
      await folder.save();

      logger.debug(
        `Folder parent changed successfully for folder ::: ${JSON.stringify(
          folder
        )}`
      );
      return response.sendSuccessResponse(
        GraphResponse.RespondWithFolder,
        "Folder parent changed successfully",
        { ...folder.toJSON() }
      );
    }

    // Change the parent of the folder
    folder.parent = undefined;
    folder.isRoot = true;
    folder.updatedAt = new Date();
    await folder.save();

    logger.debug(`Folder ::: ${JSON.stringify(folder._id)} moved to root `);

    return response.sendSuccessResponse(
      GraphResponse.RespondWithFolder,
      "Folder moved to root successfully",
      { ...folder.toJSON() }
    );
  } catch (error: any) {
    logger.error(`Error while changing folder parent: ${error}`);
    return response.sendErrorResponse(error.message, 500);
  }
};

export const deleteFolder = async (
  _: unknown,
  data: { input: IDeleteFolder },
  context: IContext
) => {
  try {
    const access = validateAccess(context.user as IUser);
    if (!access.status) {
      return response.sendErrorResponse(access.message, 401);
    }
  
    const validation = validate(folderValidator.deleteManyFolder, data.input);
    if (!validation.status) {
      return response.sendErrorResponse(validation.message, 400);
    }
    // TODO: implement delete folder
     logger.debug(
       `start call to delete folder with payload ${JSON.stringify(
         data
       )} for user :: ${context.user?.email}`
     )
    
    for (const id of data.input.ids) {
      await markFoldersAsTrash(id);
    }

    return response.sendSuccessResponse(GraphResponse.Respond, "Folder(s) deleted successfully", {});
    
  } catch (error:any) {
    logger.error(`Error while deleting folder: ${error}`);
    return response.sendErrorResponse(error.message, 500);
  }
}


// export const restoreFolder = async (
//   _: unknown,
//   data: { input: IDeleteFolder },
//   context: IContext
// ) => {
//   try {
//     const access = validateAccess(context.user as IUser);
//     if (!access.status) {
//       return response.sendErrorResponse(access.message, 401);
//     }
  
//     const validation = validate(folderValidator.deleteManyFolder, data.input);
//     if (!validation.status) {
//       return response.sendErrorResponse(validation.message, 400);
//     }
    
//     logger.debug(
//       `start call to delete folder with payload ${JSON.stringify(
//         data
//       )} for user :: ${context.user?.email}`
//     )
    
//     for (const id of data.input.ids) {
//       await restoreFolders(id);
//     }

//     return response.sendSuccessResponse(GraphResponse.Respond, "Folder(s) restored successfully", {});
//   } catch (error:any) {
//     logger.error(`Error while deleting folder: ${error}`);
//     return response.sendErrorResponse(error.message, 500);
//   }
// }