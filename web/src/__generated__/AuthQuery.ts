/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: AuthQuery
// ====================================================

export interface AuthQuery_viewer_user {
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

export interface AuthQuery_viewer {
  __typename: "Viewer";
  id: string;
  user: AuthQuery_viewer_user | null;
}

export interface AuthQuery {
  viewer: AuthQuery_viewer | null;
}
