/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export interface CreateBoardInput {
  title: string;
  clientMutationId?: string | null;
}

export interface CreateUserInput {
  username?: string | null;
  password?: string | null;
  password2?: string | null;
  clientMutationId?: string | null;
}

export interface LoginInput {
  username?: string | null;
  password?: string | null;
  clientMutationId?: string | null;
}

export interface SetBoardPublicInput {
  id: string;
  value: boolean;
  clientMutationId?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
