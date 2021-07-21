import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { Board } from "../board";
import { ModeHandler } from "../types";

export default class MoveHandler implements ModeHandler {
  initialPosition: ({ boardX: number; boardY: number } & Vector2d) | null =
    null;
  constructor(private board: Board) {}
  enter = () => {
    this.board.stage.on("mousedown", this.onMouseDown);
    this.board.stage.on("mousemove", this.onMouseMove);
    this.board.stage.on("mouseup mouseleave", this.onMouseUp);
    this.board.stage.on("wheel", this.onWheel);
    this.board.container.classList.add("moving");
  };
  onWheel = (event: Konva.KonvaEventObject<WheelEvent>) => {
    const stage = this.board.stage;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    if (event.evt.deltaY > 0) {
      this.board.zoomIn();
    } else if (event.evt.deltaY < 0) {
      this.board.zoomOut();
    }
    const newScale = stage.scaleX();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    event.evt.preventDefault();
  };
  onMouseDown = () => {
    this.board.container.classList.add("active");
    const { x, y } = this.board.stage.getPointerPosition();
    const { x: boardX, y: boardY } = this.board.stage.position();
    this.initialPosition = { x, y, boardX, boardY };
  };
  onMouseMove = () => {
    if (!this.initialPosition) return;
    const { x, y } = this.board.stage.getPointerPosition();
    const { boardX, boardY } = this.initialPosition;
    const diffX = x - this.initialPosition.x;
    const diffY = y - this.initialPosition.y;
    this.board.stage.position({ x: boardX + diffX, y: boardY + diffY });
  };
  onMouseUp = () => {
    this.board.container.classList.remove("active");
    this.initialPosition = null;
  };
  exit = () => {
    this.board.stage.off("mousedown", this.onMouseDown);
    this.board.stage.off("mousemove", this.onMouseMove);
    this.board.stage.off("mouseup mouseleave", this.onMouseUp);
    this.board.stage.off("wheel", this.onWheel);
    this.board.container.classList.remove("moving");
  };
}
