import React from "react";
import { Button, ButtonGroup, ButtonToolbar } from "react-bootstrap";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { Board } from "../../lib/board";
import { BoardMode } from "../../lib/types";

import { FaPencilAlt, FaMousePointer, FaHandRock, FaSearchMinus, FaSearchPlus, FaHome } from 'react-icons/fa';

const OP_MODE_BUTTONS: [string, React.ReactNode, BoardMode][] = [
  ["Draw", <FaPencilAlt />,BoardMode.DRAW],
  ["Select", <FaMousePointer />, BoardMode.SELECT],
  ["Move", <FaHandRock />,BoardMode.MOVE],
];

function ReactBoard({ boardId }: { boardId: string }) {
  const [opMode, setOpMode] = React.useState<BoardMode>(BoardMode.DRAW);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const boardRef = React.useRef<Board>();
  React.useEffect(() => {
    if (containerRef.current && !boardRef.current) {
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
  const opModeButtons = React.useMemo(() => {
    return OP_MODE_BUTTONS.map(([name, icon, mode]) => {
      return (
        <Button
          onClick={() => {
            setOpMode(mode);
          }}
          active={mode === opMode}
          key={name}
        >
          {icon}
        </Button>
      );
    });
  }, [setOpMode, opMode]);
  return (
    <div className="react-board-wrapper">
      <div className="board-container" ref={containerRef}></div>
      <div className="board-bottom-toolbar">
        <ButtonToolbar aria-label="Toolbar with button groups">
          <ButtonGroup className="me-2" aria-label="First group">
            {opModeButtons}
          </ButtonGroup>
          <ButtonGroup className="me-2">
            <Button
              onClick={() => {
                boardRef.current?.zoomIn();
              }}
            >
              <FaSearchPlus />
            </Button>
            <Button
              onClick={() => {
                boardRef.current?.zoomOut();
              }}
            >
              <FaSearchMinus />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button as={Link} to="/">
              <FaHome />
            </Button>
          </ButtonGroup>
        </ButtonToolbar>
      </div>
    </div>
  );
}

export default ReactBoard;
