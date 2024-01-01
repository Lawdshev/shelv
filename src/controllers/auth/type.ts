export default `

    type User {
        id: ID,
        firstName: String
        lastName: String
        email: String
        type: String
        ownedFolders: [String]
        sharedWithMe: [SharedWithMe]
    }

    type SharedWithMe {
        folder: ID
        permissions: [String]
    }

        input NewUser {
        firstName: String!
        lastName: String!
        email: String!
        password: String!
        type: String!
    }

      input Login {
        email: String!
        password: String!
    }

     input Del {
        id: ID
        email: String
    }

    type ResponseWithUser {
        message: String!
        data: User!
    }

    type UserWithToken {
        user: User!
        token: String!
    }

     type ResponseWithUserAndToken {
        message: String!
        data: UserWithToken!
    }

    type Response {
        message: String!
    }

    type Error {
        message: String!
        status: Int!
        code: String!
    }

    union RespondWithUser = Error | ResponseWithUser
    union RespondWithUserAndToken = Error | ResponseWithUserAndToken
    union Respond = Error | Response


    type Mutation {
        register(input: NewUser!): RespondWithUser!
        login(input: Login!): RespondWithUserAndToken!
       deleteuser(input: Del!): Respond!
    }

`;
