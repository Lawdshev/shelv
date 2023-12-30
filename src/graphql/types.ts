import { gql } from "apollo-server-core";
import authdef from "../controllers/auth/type";


export default gql(
    authdef
);
