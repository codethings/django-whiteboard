import React from "react";
import { useRouteMatch } from "react-router-dom";
import ReactBoard from "./reactBoard";

const Board = () => {
  const {
    params: { boardId },
  } = useRouteMatch<{ boardId: string }>();
  const id = atob(boardId).split(":")[1];
  return <ReactBoard boardId={id} />;
};

export default Board;
