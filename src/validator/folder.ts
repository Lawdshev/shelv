import Joi from "joi";
import { FolderType } from "../types/user/enum";
import { IFolder } from "../types/user/user";
import { IChangeFolderParent, IFolderRename, IRevokeAccess, IShareFolder, IDeleteFolder, IGetRootFolders } from "../types/folder/folder";
import { permissionType } from "../types/folder/enum";

export const createFolder = Joi.object<IFolder>({
  name: Joi.string().required(),
  parent: Joi.string().when("type", { is: FolderType.File, then: Joi.required() }),
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

export const changeParent = Joi.object<IChangeFolderParent>({
  id: Joi.string().required(),
  newParent: Joi.string(),
}).required()

export const shareFolder = Joi.object<IShareFolder>({
  id: Joi.string().required(),
  userId: Joi.string(),
  permissions: Joi.object({
    read: Joi.boolean(),
    write: Joi.boolean(),
    admin: Joi.boolean(),
  }).required(),
  type: Joi.string().valid(...Object.values(permissionType)).required(),
})

export const revokeAccess = Joi.object<IRevokeAccess>({
  id: Joi.string().required(),
  userId: Joi.string(),
  type: Joi.string().valid(...Object.values(permissionType)).required(),
})

export const deleteManyFolder = Joi.object<IDeleteFolder>({
   ids:Joi.array().required().items(Joi.string())
})

export const getRootFolders = Joi.object<IGetRootFolders>({
  id: Joi.string(),
  page: Joi.number(),
  perPage: Joi.number(),
  sort: Joi.object({
    field: Joi.string().valid("createdAt","title"),
    order: Joi.string().valid("asc", "desc"),
  }),
  filter: Joi.string()
})