/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateBoardInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateBoardMutation
// ====================================================

export interface CreateBoardMutation_createBoard_board {
  __typename: "Board";
  /**
   * The ID of the object
   */
  id: string;
}

export interface CreateBoardMutation_createBoard {
  __typename: "CreateBoardPayload";
  board: CreateBoardMutation_createBoard_board | null;
}

export interface CreateBoardMutation {
  createBoard: CreateBoardMutation_createBoard | null;
}

export interface CreateBoardMutationVariables {
  input: CreateBoardInput;
}
