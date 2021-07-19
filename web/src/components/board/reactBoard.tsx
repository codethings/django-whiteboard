import React from "react";
import ReactDOM from "react-dom";
import { Board } from "../../lib/board";
import { BoardMode } from "../../lib/types";

function ReactBoard({ boardId }: { boardId: string }) {
    const [opMode, setOpMode] = React.useState<BoardMode>(BoardMode.DRAW);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const boardRef = React.useRef<Board>();
    React.useEffect(() => {
      if (containerRef.current) {
        const board = new Board(containerRef.current, boardId);
        // @ts-ignore
        window.board = board;
        boardRef.current = board;
        board.run();
      }
    }, [boardId]);
    React.useEffect(() => {
      if (!boardRef.current) return;
      boardRef.current.changeMode(opMode);
    }, [opMode]);
    return (
      <div className="react-board-wrapper">
        <div className="board-container" ref={containerRef}></div>
        <div className="board-toolbar">
          <button
            className={opMode === BoardMode.DRAW ? "active" : ""}
            onClick={() => {
              setOpMode(BoardMode.DRAW);
            }}
          >
            draw
          </button>
          <button
            className={opMode === BoardMode.SELECT ? "active" : ""}
            onClick={() => {
              setOpMode(BoardMode.SELECT);
            }}
          >
            select
          </button>
          <button
            className={opMode === BoardMode.MOVE ? "active" : ""}
            onClick={() => {
              setOpMode(BoardMode.MOVE);
            }}
          >
            move
          </button>
          <button onClick={() => {
            boardRef.current?.zoomIn();
          }}>
            zoom in
          </button>
          <button onClick={() => {
            boardRef.current?.zoomOut();
          }}>
            zoom out
          </button>
        </div>
      </div>
    );
  }

export default ReactBoard;