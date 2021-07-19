/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: UserDashboardQuery
// ====================================================

export interface UserDashboardQuery_viewer_boards {
  __typename: "Board";
  title: string;
  /**
   * The ID of the object
   */
  id: string;
}

export interface UserDashboardQuery_viewer {
  __typename: "Viewer";
  id: string;
  boards: UserDashboardQuery_viewer_boards[];
}

export interface UserDashboardQuery {
  viewer: UserDashboardQuery_viewer | null;
}
