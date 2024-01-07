export default `
    input ShareAccessInput {
        id: ID!
        permissions: Permissions!
        type: String!
        userId: String
    }

    input Permissions {
        read: Boolean
        write: Boolean
        admin: Boolean
    }

    input revokeAccessInput {
        id: ID!
        userId: String
        type: String!
    }
    
     type Mutation {
         shareAccess(input: ShareAccessInput!): Respond
         revokeAccess(input: revokeAccessInput!): Respond
     }

`;
