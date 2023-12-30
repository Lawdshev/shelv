import * as authquery from "./auth/query";
import * as authmutation from "./auth/mutation";

export default {
  Query: {
    ...authquery,
  },
  Mutation: {
    ...authmutation,
  }
};
