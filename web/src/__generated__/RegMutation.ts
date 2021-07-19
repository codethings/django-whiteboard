/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateUserInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: RegMutation
// ====================================================

export interface RegMutation_createUser_viewer_user {
  __typename: "User";
  /**
   * The ID of the object
   */
  id: string;
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   */
  username: string;
}

export interface RegMutation_createUser_viewer {
  __typename: "Viewer";
  id: string;
  user: RegMutation_createUser_viewer_user | null;
}

export interface RegMutation_createUser {
  __typename: "CreateUserPayload";
  viewer: RegMutation_createUser_viewer;
}

export interface RegMutation {
  createUser: RegMutation_createUser | null;
}

export interface RegMutationVariables {
  input: CreateUserInput;
}
