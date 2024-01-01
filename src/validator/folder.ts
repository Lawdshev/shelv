import Joi from "joi";
import { FolderType } from "../types/user/enum";
import { IFolder } from "../types/user/user";
import { IFolderRename } from "../types/folder/folder";

export const createFolder = Joi.object<IFolder>({
  name: Joi.string().required(),
  parent: Joi.object({
    id: Joi.string().required(),
    path: Joi.string().required(),
  }).when("type", { is: FolderType.File, then: Joi.required() }),
  type: Joi.string()
    .valid(...Object.values(FolderType))
    .required(),
  contentLink: Joi.string().when("type", {
    is: FolderType.File,
    then: Joi.required(),
  }),
}).required();

export const renameFolder = Joi.object<IFolderRename>({
  newName: Joi.string().required(),
  id: Joi.string().required(),
}).required();
