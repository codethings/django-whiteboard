/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LoginInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: LoginMutation
// ====================================================

export interface LoginMutation_login_viewer_user {
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

export interface LoginMutation_login_viewer {
  __typename: "Viewer";
  id: string;
  user: LoginMutation_login_viewer_user | null;
}

export interface LoginMutation_login {
  __typename: "LoginPayload";
  viewer: LoginMutation_login_viewer;
}

export interface LoginMutation {
  login: LoginMutation_login | null;
}

export interface LoginMutationVariables {
  input: LoginInput;
}
