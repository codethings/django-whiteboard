import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Board } from "../board";
import { BoardObjectAttrs, ModeHandler } from "../types";

export default class SelectHandler implements ModeHandler {
  selectionRect = new Konva.Rect({
    fill: "rgba(0,0,255,0.1)",
    visible: false,
  });
  selectionRectCoords: [number, number, number, number] = [0, 0, 0, 0];
  trLayer = new Konva.Layer();
  tr = new Konva.Transformer();
  boundingRects: { [key: string]: Konva.Rect } = {};
  constructor(private board: Board) {
    this.trLayer.add(this.tr);
    this.trLayer.add(this.selectionRect);
  }
  enter = () => {
    this.board.stage.on("click tap", this.onClick);
    this.board.stage.on("mousedown touchstart", this.onMouseDown);
    this.board.stage.on("mousemove touchmove", this.onMouseMove);
    this.board.stage.on("mouseup touchend", this.onMouseUp);
    this.board.stage.add(this.trLayer);
    this.tr.on("transformend", this.onTransformEnd);
    this.board.stage.on("dragend", this.onTransformEnd);
    this.board.stage.on("dragstart", this.onDragStart);
    this.board.layer.children!.forEach((shape) => {
      shape.draggable(true);
    });
  };
  exit = () => {
    this.board.stage.off("click tap", this.onClick);
    this.board.stage.off("mousedown touchstart", this.onMouseDown);
    this.board.stage.off("mousemove touchmove", this.onMouseMove);
    this.board.stage.off("mouseup touchend", this.onMouseUp);
    this.board.stage.off("dragend", this.onTransformEnd);
    this.board.stage.off("dragstart", this.onDragStart);
    this.tr.off("transformend", this.onTransformEnd);
    this.trLayer.remove();
    this.board.layer.children!.forEach((shape) => {
      shape.draggable(false);
    });
    this.setSelectedShapes([]);
  };
  processAddedShape = (shape: Konva.Shape) => {
    shape.draggable(true);
  };
  onDragStart = () => {
    this.selectionRect.visible(false);
    this.setSelectedShapes([]);
  }
  onTransformEnd = () => {
    const nodes = this.tr.nodes();
    // [[id, {transform: [number,..]}]]
    const updates: [string, BoardObjectAttrs][] = [];
    for (const node of nodes) {
      if (!node.id()) continue;
      updates.push([node.id(), { transform: node.getTransform().m }]);
    }
    fetch("/set-objects-attrs", {
      method: "POST",
      body: JSON.stringify({
        boardId: this.board.boardId,
        objectsAttrs: updates,
      }),
      headers: {
        "Content-Type": "application/json",
        "session-id": this.board.sessionId,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Not ok");
        return response.json();
      })
      .then((data) => {
        return console.log(data);
      });
  };
  onMouseDown = () => {
    if (this.tr.nodes().length) {
      return;
    }
    const { x, y } = this.board.stage.getRelativePointerPosition();
    this.selectionRectCoords = [x, y, x, y];
    this.selectionRect.visible(true);
    this.selectionRect.width(0);
    this.selectionRect.height(0);
  };
  onMouseMove = () => {
    if (!this.selectionRect.visible()) {
      return;
    }

    const { x, y } = this.board.stage.getRelativePointerPosition();
    this.selectionRectCoords[2] = x;
    this.selectionRectCoords[3] = y;

    const [x1, y1, x2, y2] = this.selectionRectCoords;

    this.selectionRect.setAttrs({
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    });
    const shapes = this.board.layer.children!;
    const box = this.selectionRect.getClientRect();
    const overlapShapes = shapes.filter((shape) => {
      return Konva.Util.haveIntersection(box, shape.getClientRect());
    });
    this.setBoundingRects(overlapShapes);
  };
  onMouseUp = () => {
    if (!this.selectionRect.visible()) {
      return;
    }
    // update visibility in timeout, so we can check it in click event
    setTimeout(() => {
      this.selectionRect.visible(false);
    });

    const shapes = this.board.layer.children!;
    const box = this.selectionRect.getClientRect();
    if (box.width === 0 || box.height === 0) return;
    var selected = shapes.filter((shape) => {
      return Konva.Util.haveIntersection(
        box,
        shape.getClientRect()
      );
    });
    this.setSelectedShapes(selected);
  };
  onClick = (e: KonvaEventObject<MouseEvent>) => {
    if (e.target === this.board.stage) {
      this.setSelectedShapes([]);
      return;
    }
    if (!this.selectionRect.visible()) {
      return;
    }

    if (e.target instanceof Konva.Shape) {
      this.setSelectedShapes([e.target]);
      return;
    }
  };

  setSelectedShapes = (shapes: (Konva.Shape | Konva.Group)[]) => {
    this.setBoundingRects(shapes);
    this.tr.nodes([...shapes, ...Object.values(this.boundingRects)]);
  };

  setBoundingRects = (shapes: (Konva.Shape | Konva.Group)[]) => {
    const idsToRemoveRect: string[] = [];
    const shapesToAddRect: (Konva.Shape | Konva.Group)[] = [];

    const shapesIds = new Set(shapes.map((s) => s.id()));
    const currentIds = new Set(Object.keys(this.boundingRects));

    shapes.forEach((shape) => {
      if (!(shape.id() in this.boundingRects)) {
        shapesToAddRect.push(shape);
      }
    });
    currentIds.forEach((k) => {
      if (!shapesIds.has(k)) {
        idsToRemoveRect.push(k);
      }
    });

    idsToRemoveRect.forEach((id) => {
      this.removeBoundingRect(id);
    });
    shapesToAddRect.forEach((shape) => {
      this.drawBoundingRect(shape);
    });
  };

  drawBoundingRect = (shape: Konva.Node) => {
    const { x, y, height, width } = shape.getClientRect({
      // @ts-ignore
      relativeTo: this.board.stage,
    });
    const rect = new Konva.Rect({
      x,
      y,
      height,
      width,
      stroke: "rgba(128,128,255,0.5)",
    });
    this.boundingRects[shape.id()] = rect;
    this.trLayer.add(rect);
  };
  removeBoundingRect = (id: string) => {
    const rect = this.boundingRects[id];
    if (!rect) return;
    rect.destroy();
    delete this.boundingRects[id];
  };
}
