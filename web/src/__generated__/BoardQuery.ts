/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BoardUserRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: BoardQuery
// ====================================================

export interface BoardQuery_board_User {
  __typename: "User";
}

export interface BoardQuery_board_Board_boardUsers_user {
  __typename: "User";
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   */
  username: string;
}

export interface BoardQuery_board_Board_boardUsers {
  __typename: "BoardUser";
  id: string;
  user: BoardQuery_board_Board_boardUsers_user;
  role: BoardUserRole;
}

export interface BoardQuery_board_Board {
  __typename: "Board";
  /**
   * The ID of the object
   */
  id: string;
  title: string;
  public: boolean;
  viewerRole: BoardUserRole | null;
  boardUsers: BoardQuery_board_Board_boardUsers[];
}

export type BoardQuery_board = BoardQuery_board_User | BoardQuery_board_Board;

export interface BoardQuery {
  board: BoardQuery_board | null;
}

export interface BoardQueryVariables {
  id: string;
}
