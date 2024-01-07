import { Request } from "express";
import * as jwt from "../helpers/jwt";
import * as model from "../model";
import mongoose from "mongoose";
import * as response from "../helpers/response";
import { IContext, MakeResponse } from "../types/misc/generic";
import { IUser } from "../types/user/user";
import { GraphError } from "../types/misc/graphql";
import { logger } from "../log/logger";
import getFilePathById from "../helpers/folder";

export default async (req: Request): Promise<IContext | GraphError> => {
  const ip = (req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress) as string;

  const referer =
    (req.headers["x-accountable-dev"] as string) || req.headers.referer || "";

  const domain = req.protocol + "://" + req.get("host");

  if (
    !req ||
    !req.headers ||
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ") ||
    !req.headers.authorization.split(" ")[1] ||
    !req.headers.authorization.split(" ")[1].length
  ) {
    return { ip, referer, domain };
  }

  const token = req.headers.authorization!.split(" ")[1];

  if (token) {
    const verified = await jwt.verifyToken(token);
    if (verified.status) {
      const account = await model.user.findById(
        verified.data["id"] as mongoose.ObjectId
      );
      if (!account) {
        return response.sendErrorResponse("unauthorized", 403);
      }
      return { user: account.toJSON(), ip, referer, domain };
    }
    return response.sendErrorResponse(verified.message, 401);
  }
  return { ip, referer, domain };
};

export const validateAccess = (user: IUser): MakeResponse => {
  if (!user) {
    return {
      status: false,
      message: "Login required!",
      data: {},
    };
  }

  return {
    status: true,
    message: "Access granted!",
    data: {},
  };
};

export const getPermissions = async (
  user: IUser,
  folderId: string | mongoose.ObjectId
) => {
  if (!user) {
    return {
      status: false,
      message: "Login required!",
      permission: {
        read: false,
        write: false,
        admin: false,
      },
    };
  }
  if (!folderId) {
    return {
      status: false,
      message: "Folder not found!",
      permission: {
        read: false,
        write: false,
        admin: false,
      },
    };
  }
  try {
    const folder = await model.folder.findById(folderId);
    if (!folder) {
      return {
        status: false,
        message: "Folder not found!",
        permission: {
          read: false,
          write: false,
          admin: false,
        },
      };
    }
    if (folder.createdBy.toString() === user._id.toString()) {
      return {
        status: true,
        message: "Access granted!",
        permission: {
          read: true,
          write: true,
          admin: true,
        },
      };
    }

    const publicAccess = folder.accessByLink;
    const privateAccess = folder.sharedWith.find(
      (u) => u.toString() === user._id.toString()
    );
    if (publicAccess.access || privateAccess) {
      return {
        status: true,
        message: "Access granted!",
        permission: {
          read:
            publicAccess?.permissions?.includes("read") ||
            privateAccess?.permissions?.includes("read")
              ? true
              : false,
          write:
            publicAccess?.permissions?.includes("write") ||
            privateAccess?.permissions?.includes("write")
              ? true
              : false,
          admin:
            publicAccess?.permissions?.includes("admin") ||
            privateAccess?.permissions?.includes("admin")
              ? true
              : false,
        },
      };
    }

    logger.debug(`user ${user.email} does not have direct access to folder ${folderId},checking for hierarchical access`);

    const path = await getFilePathById(folderId);
    if(!path){
      return {
        status: false,
        message: "Could not get folder path!",
        permission: {
          read: false,
          write: false,
          admin: false,
        },
      };
    }
    
    const ancestors: string[] = path.split("/").reverse();

    // Check for the nearest ancestral permission
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const ancestorFolder = await model.folder.findById(ancestors[i]);
      if (ancestorFolder) {
        const ancestorAccess = ancestorFolder.accessByLink;
        const ancestorPrivateAccess = ancestorFolder.sharedWith.find(
          (u) => u.toString() === user._id.toString()
        );

        if (ancestorAccess.access || ancestorPrivateAccess) {
          return {
            status: true,
            message: "Access granted!",
            permission: {
              read:
                ancestorAccess.permissions.includes("read") ||
                ancestorPrivateAccess?.permissions.includes("read")
                  ? true
                  : false,
              write:
                ancestorAccess.permissions.includes("write") ||
                ancestorPrivateAccess?.permissions.includes("write")
                  ? true
                  : false,
              admin:
                ancestorAccess.permissions.includes("admin") ||
                ancestorPrivateAccess?.permissions.includes("admin")
                  ? true
                  : false,
            },
          };
        }
      }
    }

    // If no access is found in ancestors, deny access
    return {
      status: false,
      message: "You do not have access to this folder.",
      permission: {
        read: false,
        write: false,
        admin: false,
      },
    };
  } catch (error: any) {
    logger.error(error.message);
    return {
      error: true,
      status: false,
      message: `Error checking permissions::: ${error.message}`,
      permission: {
        read: false,
        write: false,
        admin: false,
      },
    };
  }
};

