export default `
    scalar DateTime

    input NewFolder {
        name: String!
        parent: ParentInput
        type: String!
        contentLink: String
    }
    input ParentInput {
        id: ID!
        path: String!
    }

    input renameFolderInput {
        id: ID!
        newName: String!       
    }
   

    type Folder {
        name: String!
        parent: Parent
        path: String
        children: [ID]
        type: String!
        contentLink: String
        isRoot: Boolean!
        accessByLink: AccessByLink
        sharedWith: [SharedWith]
        createdAt: DateTime
        updatedAt: DateTime
        createdBy: ID
        id: ID
    }

    type Parent {
        id: ID
       path: String
    }

    type SharedWith {
    user: ID
    permissions: [String]
    }

    type AccessByLink {
    access: Boolean
    permissions: [String]
    }

    type Permission {
        read: Boolean
        write: Boolean
        admin: Boolean
    }
    
    type ResponseWithFolder {
        message: String!
        data: Folder!
    }

    type FolderWithPermissions {
        folder: Folder
        permissions: Permission
    }

    type ResponseWithFolderAndPermissions {
        message: String!
        data: FolderWithPermissions
    }

    

    union RespondWithFolder = Error | ResponseWithFolder
    union RespondWithFolderAndPermissions = Error | ResponseWithFolderAndPermissions

    type Query {
        getFolder(id: ID!): RespondWithFolderAndPermissions
    }

    type Mutation {
        createFolder(input: NewFolder!): RespondWithFolder  
        renameFolder(input: renameFolderInput!): RespondWithFolder   
    }
`;
