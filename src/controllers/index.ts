import * as authmutation from "./auth/mutation";
import * as folderMutation from "./folder/mutation";
import * as profilequery from "./profile/query";
import * as folderquery from "./folder/query";


export default {
  Query: {
    ...profilequery,
    ...folderquery
  },
  Mutation: {
    ...authmutation,
    ...folderMutation
  }
};
