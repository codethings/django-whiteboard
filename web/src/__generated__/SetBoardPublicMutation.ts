/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SetBoardPublicInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SetBoardPublicMutation
// ====================================================

export interface SetBoardPublicMutation_setBoardPublic_board {
  __typename: "Board";
  /**
   * The ID of the object
   */
  id: string;
  title: string;
  public: boolean;
}

export interface SetBoardPublicMutation_setBoardPublic {
  __typename: "SetBoardPublicPayload";
  board: SetBoardPublicMutation_setBoardPublic_board;
}

export interface SetBoardPublicMutation {
  setBoardPublic: SetBoardPublicMutation_setBoardPublic | null;
}

export interface SetBoardPublicMutationVariables {
  input: SetBoardPublicInput;
}
