import { Board } from ".";
import { ModeHandler } from "./types";

export class DrawHandler implements ModeHandler {
  constructor(private board: Board) {}
  enter = () => {
    this.board.stage.on("mousedown", this.onMouseDown);
    this.board.stage.on("mouseup", this.onMouseUp);
    this.board.stage.on("mousemove", this.onMouseMove);
    this.board.stage.on("mouseleave", this.onMouseUp);
    console.log("here");
  };
  exit = () => {
    this.board.stage.off("mousedown", this.onMouseDown);
    this.board.stage.off("mouseup", this.onMouseUp);
    this.board.stage.off("mousemove", this.onMouseMove);
    this.board.stage.off("mouseleave", this.onMouseUp);
  }
  onMouseDown = () => {
    const { board } = this;
    const { x, y } = board.stage.getPointerPosition();
    board.currentDrawingObject = {
      type: "path",
      points: [[x, y]],
    };
    board.draw();
  };
  onMouseUp = () => {
    const { board } = this;
    if (board.currentDrawingObject) {
      board.sendCurrentDrawingObject();
      board.draw();
    }
  };
  onMouseMove = () => {
    const { board } = this;
    const { x, y } = board.stage.getPointerPosition();
    if (!board.currentDrawingObject) return;
    if (board.currentDrawingObject.type === "path") {
      board.currentDrawingObject.points.push([x, y]);
    }
    board.draw();
  };
}
