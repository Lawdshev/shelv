import { logger } from "../log/logger";
import * as model from "../model";
import mongoose from "mongoose";

async function getFilePathById(folderId: mongoose.ObjectId | string) {
  try {
    if (!folderId) {
      throw new Error("Invalid folder id");
    }

    logger.debug(`start call to get folder path with id :: ${folderId}`);

    let path = "";
    let currentFolder = await model.folder.findById(folderId).exec();
    if (!currentFolder) {
      throw new Error("Folder not found");
    }
    path = `${currentFolder._id}`;

    //if the current folder has parent, get the parent id and prefix it to the path and if the parent has parent, get the parent id and prefix it to the path till the root is reached

    while (currentFolder?.parent) {
      path = `${currentFolder.parent.toString()}/${path}`;
      currentFolder = await model.folder.findById(currentFolder.parent).exec();
      if (!currentFolder) {
        logger.debug(
          `end call to get folder path with id :: ${folderId} because parent not found`
        );
        break;
      }
    }

    logger.debug(
      `end call to get folder path with id :: ${folderId} and got path ${path}`
    );
    return path;
  } catch (error: any) {
    logger.error(`Error while getting folder path: ${error.message}`);
    return null;
  }
}

export default getFilePathById;
