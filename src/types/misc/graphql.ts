import { HttpStatus } from './http';


export enum GraphResponse {
  Respond = "Response",
  RespondWithUserAndToken = "ResponseWithUserAndToken",
  RespondWithUser = "ResponseWithUser",
}

export interface GraphError {
    __typename: 'Error';
    message: string;
    code: HttpStatus;
    status: number;
}