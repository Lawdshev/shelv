import { Request } from "express";
import * as jwt from "../helpers/jwt";
import * as model from "../model";
import mongoose from "mongoose";
import * as response from "../helpers/response";
import { IContext, MakeResponse } from "../types/misc/generic";
import { IUser } from "../types/user/user";
import { GraphError } from "../types/misc/graphql";

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

export const validateAccess = (
  user: IUser,
): MakeResponse => {
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
