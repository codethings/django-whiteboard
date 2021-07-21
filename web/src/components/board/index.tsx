import { gql, useQuery } from "@apollo/client";
import React from "react";
import { useRouteMatch } from "react-router-dom";
import {
  BoardQuery,
  BoardQueryVariables,
} from "../../__generated__/BoardQuery";
import ReactBoard from "./reactBoard";

const boardQuery = gql`
  query BoardQuery($id: ID!) {
    board: node(id: $id) {
      ... on Board {
        id
        title
      }
    }
  }
`;

const Board = () => {
  const {
    params: { boardId },
  } = useRouteMatch<{ boardId: string }>();
  const { data, loading } = useQuery<BoardQuery, BoardQueryVariables>(
    boardQuery,
    { variables: { id: boardId } }
  );
  if (loading) return <>Loading</>;
  if (data && !data.board) {
    return <>No Access</>
  }
  const id = atob(boardId).split(":")[1];
  return <ReactBoard boardId={id} />;
};

export default Board;
