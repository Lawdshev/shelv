import { IUser } from "../../types/user/user";
import validate from "../../validator/validate";
import * as  authvalidator  from "../../validator/auth";
import * as response from "../../helpers/response";
import * as bcrypt from "../../helpers/bcrypt";
import { logger } from "../../log/logger";
import * as model from "../../model";
import { GraphResponse } from "../../types/misc/graphql";
import { ILogin } from "../../types/user/auth";
import * as jwt from "../../helpers/jwt";
import { IContext } from "../../types/misc/generic";
import { validateAccess } from "../../middleware/authenticate";

export const register = async (
  _: unknown,
  data: { input: IUser },
) => {
  try {
    //validate input
    const validation = validate(authvalidator.register, data.input);
    if (!validation.status) {
      return response.sendErrorResponse(validation.message, 400);
    }
    const userExists = await authvalidator.userExists(data.input.email);
    if (userExists) {
      return response.sendErrorResponse("user already exists", 400);
    }

    //logging process
    logger.debug(
      `start call to register user ${
        data.input.email
      } with payload ${JSON.stringify({
        ...data.input,
        password: "********",
      })}`
    );

    //create user in db
    const newUser = new model.user({
      ...data.input,
      password: await bcrypt.generateHashedPassword(data.input.password),
    });
    await newUser.save();

    logger.debug(
      `end call to register user ${
        data.input.email
      } with payload ${JSON.stringify({
        ...data.input,
        password: "********",
      })} :: created user with ${newUser._id}`
    );

    return response.sendSuccessResponse(
      GraphResponse.RespondWithUser,
      "user created successfully",
      {
        ...newUser.toJSON(),
        password: undefined,
      }
    );
  } catch (error:any) {
     logger.error(
       `error while registering user ${
         data.input.email
       } with payload ${JSON.stringify(data.input)} :: ${error.message}`
     );
      return response.sendErrorResponse(error.message, 500);
  }
};

export const login = async (
  _: unknown,
  data: { input: ILogin },
) => {

  try {
     const validation = validate(authvalidator.login, data.input);
     if (!validation.status) {
       return response.sendErrorResponse(validation.message, 400);
     }

     logger.debug(`start call to login user ${data.input.email}`);

     const user = await model.user.findOne({ email: data.input.email });
     if (!user) {
       return response.sendErrorResponse("Invalid login credentials!",400);
     }
    
    const isMatch = await bcrypt.compareHashedPassword(data.input.password, user.password)
    if (!isMatch) {
      return response.sendErrorResponse("Invalid login credentials!",400);
    }
    
    logger.debug(`end call to login user ${data.input.email}`);

    logger.info(`user logged in successfully ${user}`);

     return response.sendSuccessResponse(
       GraphResponse.RespondWithUserAndToken,
       "user logged in successfully",
       {
         user: user,
         token: jwt.signToken({ id: user._id }),
       }
     );
    
  } catch (error:any) {
     logger.error(
       `error while logging in user ${
         data.input.email
       } with payload ${JSON.stringify({ email: data.input.email })} :: ${
         error.message
       }`
     );
     return response.sendErrorResponse(error.message, 500);
  }

}

export const deleteuser = async (
  _: unknown,
  { input: { email, id } }: { input: IUser },
  context: IContext
) => {
  try {
    const access = validateAccess(context.user as IUser);
    if (!access.status) {
      return response.sendErrorResponse(access.message, 400);
    }

    const deletionQuery = {
      $or: [{ email: email.toLowerCase() }, { _id: id }],
    };

    const { deletedCount } = await model.user.deleteMany(deletionQuery);

    logger.info(
      `Deleted ${deletedCount} users with query: ${JSON.stringify(
        deletionQuery
      )}`
    );

    if (deletedCount === 0) {
      return response.sendErrorResponse("User not found", 400);
    }

    return response.sendSuccessResponse(
      GraphResponse.Respond,
      "User deleted successfully",
      {}
    );
  } catch (error: any) {
    logger.error(`Error deleting user: ${error.message}`);
    return response.sendErrorResponse(error.message, 500);
  }
};

