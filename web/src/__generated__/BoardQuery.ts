/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BoardQuery
// ====================================================

export interface BoardQuery_board_User {
  __typename: "User";
}

export interface BoardQuery_board_Board {
  __typename: "Board";
  /**
   * The ID of the object
   */
  id: string;
  title: string;
  public: boolean;
}

export type BoardQuery_board = BoardQuery_board_User | BoardQuery_board_Board;

export interface BoardQuery {
  board: BoardQuery_board | null;
}

export interface BoardQueryVariables {
  id: string;
}
