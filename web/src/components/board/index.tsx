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
        public
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
  const board = data?.board;
  if (!board) {
    return <>No Access</>
  }
  if (board.__typename !== "Board") return null;
  return <ReactBoard board={board} />;
};

export default Board;
