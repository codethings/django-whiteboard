/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ShareBoardByUsernameInput, BoardUserRole } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ShareBoardByUsernameMutation
// ====================================================

export interface ShareBoardByUsernameMutation_shareBoardByUsername_board_boardUsers_user {
  __typename: "User";
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   */
  username: string;
}

export interface ShareBoardByUsernameMutation_shareBoardByUsername_board_boardUsers {
  __typename: "BoardUser";
  user: ShareBoardByUsernameMutation_shareBoardByUsername_board_boardUsers_user;
  role: BoardUserRole;
}

export interface ShareBoardByUsernameMutation_shareBoardByUsername_board {
  __typename: "Board";
  /**
   * The ID of the object
   */
  id: string;
  boardUsers: ShareBoardByUsernameMutation_shareBoardByUsername_board_boardUsers[];
}

export interface ShareBoardByUsernameMutation_shareBoardByUsername {
  __typename: "ShareBoardByUsernamePayload";
  board: ShareBoardByUsernameMutation_shareBoardByUsername_board | null;
}

export interface ShareBoardByUsernameMutation {
  shareBoardByUsername: ShareBoardByUsernameMutation_shareBoardByUsername | null;
}

export interface ShareBoardByUsernameMutationVariables {
  input: ShareBoardByUsernameInput;
}
