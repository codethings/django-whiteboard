import React from "react";
import { Button, ButtonGroup, ButtonToolbar } from "react-bootstrap";
import { useToggle } from "react-use";
import { Link } from "react-router-dom";
import { Board } from "../../lib/board";
import { BoardMode } from "../../lib/types";

import { BoardQuery_board_Board } from "../../__generated__/BoardQuery";
import { BoardUserRole } from "../../__generated__/globalTypes";

import {
  FaPencilAlt,
  FaMousePointer,
  FaHandPaper,
  FaSearchMinus,
  FaSearchPlus,
  FaHome,
  FaShareAlt,
} from "react-icons/fa";
import ShareBoardModal from "./shareModal";

const OP_MODE_BUTTONS: [string, React.ReactNode, BoardMode][] = [
  ["Draw", <FaPencilAlt />, BoardMode.DRAW],
  ["Select", <FaMousePointer />, BoardMode.SELECT],
  ["Move", <FaHandPaper />, BoardMode.MOVE],
];

function ReactBoard({ board }: { board: BoardQuery_board_Board }) {
  // const boardId = board.id;
  const boardIntId = atob(board.id).split(":")[1];
  const [opMode, setOpMode] = React.useState<BoardMode>(BoardMode.DRAW);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const boardRef = React.useRef<Board>();
  React.useEffect(() => {
    if (containerRef.current && !boardRef.current) {
      const board = new Board(containerRef.current, boardIntId);
      // @ts-ignore
      window.board = board;
      boardRef.current = board;
      board.run();
    }
  }, [boardIntId]);
  React.useEffect(() => {
    if (!boardRef.current) return;
    boardRef.current.changeMode(opMode);
  }, [opMode]);
  const [shareModalOpen, toggleShareModal] = useToggle(false);
  const opModeButtons = React.useMemo(() => {
    return OP_MODE_BUTTONS.map(([name, icon, mode]) => {
      return (
        <Button
          onClick={() => {
            setOpMode(mode);
          }}
          active={mode === opMode}
          key={name}
          title={name}
        >
          {icon}
        </Button>
      );
    });
  }, [setOpMode, opMode]);
  return (
    <div className="react-board-wrapper">
      <ShareBoardModal
        board={board}
        open={shareModalOpen}
        onHide={toggleShareModal}
      />
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
              title="Zoom in"
            >
              <FaSearchPlus />
            </Button>
            <Button
              onClick={() => {
                boardRef.current?.zoomOut();
              }}
              title="Zoom out"
            >
              <FaSearchMinus />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button title="Home" as={Link} to="/">
              <FaHome />
            </Button>
            {board.viewerRole === BoardUserRole.OWNER && (
              <Button title="Share" onClick={toggleShareModal}>
                <FaShareAlt />
              </Button>
            )}
          </ButtonGroup>
        </ButtonToolbar>
      </div>
    </div>
  );
}

export default ReactBoard;
