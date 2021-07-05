import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Board } from "./board";
import { ModeHandler } from "./types";

export class DrawHandler implements ModeHandler {
  constructor(private board: Board) {}
  enter = () => {
    this.board.stage.on("mousedown", this.onMouseDown);
    this.board.stage.on("mouseup", this.onMouseUp);
    this.board.stage.on("mousemove", this.onMouseMove);
    this.board.stage.on("mouseleave", this.onMouseUp);
  };
  exit = () => {
    this.board.stage.off("mousedown", this.onMouseDown);
    this.board.stage.off("mouseup", this.onMouseUp);
    this.board.stage.off("mousemove", this.onMouseMove);
    this.board.stage.off("mouseleave", this.onMouseUp);
  };
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

export class SelectHandler implements ModeHandler {
  selectionRect = new Konva.Rect({
    fill: "rgba(0,0,255,0.5)",
    visible: false,
  });
  selectionRectCoords: [number, number, number, number] = [0, 0, 0, 0];
  constructor(private board: Board) {}
  enter = () => {
    this.board.stage.on("click tap", this.onClick);
    this.board.stage.on("mousedown touchstart", this.onMouseDown);
    this.board.stage.on("mousemove touchmove", this.onMouseMove);
    this.board.stage.on("mouseup touchend", this.onMouseUp);
    this.board.trLayer.add(this.selectionRect);
  };
  exit = () => {
    this.board.stage.off("click tap", this.onClick);
    this.board.stage.off("mousedown touchstart", this.onMouseDown);
    this.board.stage.off("mousemove touchmove", this.onMouseMove);
    this.board.stage.off("mouseup touchend", this.onMouseUp);
    this.selectionRect.remove();
    this.board.tr.nodes([]);
  };
  onMouseDown = () => {
    if (this.board.tr.nodes().length) {
      console.log("ignore");
      return;
    };
    const { x, y } = this.board.stage.getPointerPosition();
    this.selectionRectCoords = [x, y, x, y];
    this.selectionRect.visible(true);
    this.selectionRect.width(0);
    this.selectionRect.height(0);
  };
  onMouseMove = () => {
    if (!this.selectionRect.visible()) {
      return;
    }

    const { x, y } = this.board.stage.getPointerPosition();
    this.selectionRectCoords[2] = x;
    this.selectionRectCoords[3] = y;

    const [x1, y1, x2, y2] = this.selectionRectCoords;

    this.selectionRect.setAttrs({
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    });
  };
  onMouseUp = () => {
    if (!this.selectionRect.visible()) {
      return;
    }
    // update visibility in timeout, so we can check it in click event
    setTimeout(() => {
      this.selectionRect.visible(false);
    });

    const shapes = this.board.layer.children;
    const box = this.selectionRect.getClientRect();
    var selected = shapes.filter((shape) =>
      Konva.Util.haveIntersection(box, shape.getClientRect())
    );
    this.board.tr.nodes(selected);
  };
  onClick = (e: KonvaEventObject<MouseEvent>) => {
    if (!this.selectionRect.visible()) {
      return;
    }
    if (e.target === this.board.stage) {
      this.board.tr.nodes([]);
      return;
    }

    if (e.target instanceof Konva.Shape) {
      this.board.tr.nodes([e.target]);
      return;
    }
  };
}
