import { gql } from "apollo-server-core";
import authdef from "../controllers/auth/type";
import folderdef from "../controllers/folder/type";
import profiledef from "../controllers/profile/type";
import permissionDef from "../controllers/permissions/type";

export default gql(
    authdef +
    folderdef +
    profiledef +
    permissionDef
);
