export default `
    scalar DateTime

    input NewFolder {
        name: String!
        parent: ID
        type: String!
        contentLink: String
    }

    input renameFolderInput {
        id: ID!
        newName: String!       
    }

    input ChangeParentInput {
        id: ID!
        newParent: ID
    }

    input deleteFolderInput {
        ids: [ID!]!
    }

    type Folder {
        name: String!
        parent: ID
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
        trash: Boolean
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
        changeParent(input: ChangeParentInput!): RespondWithFolder
        deleteFolder(input: deleteFolderInput!): Respond
    }
`;
