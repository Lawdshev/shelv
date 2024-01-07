import mongoose from "mongoose";
import *  as model from "../model";
import * as Response from "../helpers/response";
import { logger } from "../log/logger";

export  default async function markFoldersAsTrash(rootFolderId: mongoose.Schema.Types.ObjectId | string) {
    if (!rootFolderId) {
        return Response.makeResponse(false, "folderId is required", {});
    }
    
    try {
        const queue = [rootFolderId];
        while (queue.length > 0) {
          const currentFolderId = queue.shift();
          // Update the current folder to mark it as trash
          await model.folder.findByIdAndUpdate(currentFolderId, {
            trash: true,
            deletedAt: new Date(),
          });

          // Get the children of the current folder
          const children = await model.folder.find({ parent: currentFolderId });

          // Add children to the queue for processing
          queue.push(...children.map((child) => child._id));
        }
    } catch (error: any) {
        logger.error(`Error while deleting folder: ${error.message}`);
        return Response.makeResponse(false, error.message, {});
        
    }
}

// export async function restoreFolders(rootFolderId: mongoose.Schema.Types.ObjectId | string) {
//   if (!rootFolderId) {
//     return Response.makeResponse(false, "folderId is required", {});
//   }

//   try {
//     const queue = [rootFolderId];
//     while (queue.length > 0) {
//       const currentFolderId = queue.shift();
//       // Update the current folder to mark it as trash
//       await model.folder.findByIdAndUpdate(currentFolderId, {
//         trash: false,
//         deletedAt: null,
//       });
//   }
// }