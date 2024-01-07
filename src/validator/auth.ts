import Joi from "joi";
import { AccountType } from "../types/user/enum";
import {
  ILogin,
  IPasswordReset,
  IPasswordUpdate,
  IUpdateUser
} from "../types/user/auth";
import { IUser } from "../types/user/user";
import * as model from '../model';

export const register = Joi.object<IUser>({
  email: Joi.string().email().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  type: Joi.string()
    .valid(...Object.values(AccountType))
    .required(),

  password: Joi.string()
    .min(8)
    // removed to allow for flexibility
    // .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#.?&])[A-Za-z\d@$!%*#?.&]{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one number, one letter and one special character",
      "string.min": "Password must be at least 8 characters long",
    }),
}).required();

export const login = Joi.object<ILogin>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).required();


export const requestEmailVerification = Joi.object<ILogin>({
  email: Joi.string().email().required(),
}).required();

export const verifyEmail = Joi.object<IPasswordReset>({
  token: Joi.string().required(),
}).required();

export const updatePassword = Joi.object<IPasswordUpdate>({
  newPassword: Joi.string()
    .min(8)
    // removed to allow for flexibility
    // .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#.?&])[A-Za-z\d@$!%*#?.&]{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one number, one letter and one special character",
      "string.min": "Password must be at least 8 characters long",
    }),
    confirmPassword: Joi.string().required().valid(Joi.ref("newPassword")),
  oldPassword: Joi.string().required(),
}).required();

export const recoverPassword = Joi.object<IPasswordReset>({
  email: Joi.string().email().required(),
}).required();

export const resetPassword = Joi.object<IPasswordReset>({
  token: Joi.string().required(),
  password: Joi.string()
    .min(8)
    // removed to allow for flexibility
    // .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#.?&])[A-Za-z\d@$!%*#?.&]{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one number, one letter and one special character",
      "string.min": "Password must be at least 8 characters long",
    }),
}).required();


//check user

export const userExists = async (email: string): Promise<boolean> => {
    const existingUser = await model.user.findOne({ email }).exec();
    return !!existingUser; // Returns true if existingUser is truthy (user found), false otherwise
};

export const editUser = Joi.object<IUpdateUser>({
  email: Joi.string().email(),
  firstName: Joi.string(),
  lastName: Joi.string(),
})
