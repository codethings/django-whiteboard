import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Board } from "../board";
import { BoardObjectAttrs, ModeHandler } from "../types";


export default class SelectHandler implements ModeHandler {
    selectionRect = new Konva.Rect({
        fill: "rgba(0,0,255,0.5)",
        visible: false,
    });
    selectionRectCoords: [number, number, number, number] = [0, 0, 0, 0];
    constructor(private board: Board) { }
    enter = () => {
        this.board.stage.on("click tap", this.onClick);
        this.board.stage.on("mousedown touchstart", this.onMouseDown);
        this.board.stage.on("mousemove touchmove", this.onMouseMove);
        this.board.stage.on("mouseup touchend", this.onMouseUp);
        this.board.trLayer.add(this.selectionRect);
        this.board.tr.on("transformend", this.onTransformEnd);
        this.board.stage.on("dragend", this.onTransformEnd);
        this.board.layer.children.forEach((shape) => {
            shape.draggable(true);
        });
    };
    exit = () => {
        this.board.stage.off("click tap", this.onClick);
        this.board.stage.off("mousedown touchstart", this.onMouseDown);
        this.board.stage.off("mousemove touchmove", this.onMouseMove);
        this.board.stage.off("mouseup touchend", this.onMouseUp);
        this.board.stage.off("dragend", this.onTransformEnd);
        this.selectionRect.remove();
        this.board.layer.children.forEach((shape) => {
            shape.draggable(false);
        });
        this.board.tr.nodes([]);
    };
    processAddedShape = (shape: Konva.Shape) => {
        shape.draggable(true);
    };
    onTransformEnd = () => {
        const nodes = this.board.tr.nodes();
        // [[id, {transform: [number,..]}]]
        const updates: [string, BoardObjectAttrs][] = [];
        for (const node of nodes) {
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
                if (!response.ok)
                    throw new Error("Not ok");
                return response.json();
            })
            .then((data) => {
                return console.log(data);
            });
    };
    onMouseDown = () => {
        if (this.board.tr.nodes().length) {
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
        var selected = shapes.filter((shape) => {
            return Konva.Util.haveIntersection(box, shape.getClientRect());
        });
        this.board.tr.nodes(selected);
    };
    onClick = (e: KonvaEventObject<MouseEvent>) => {
        if (e.target === this.board.stage) {
            this.board.tr.nodes([]);
            return;
        }
        if (!this.selectionRect.visible()) {
            return;
        }

        if (e.target instanceof Konva.Shape) {
            this.board.tr.nodes([e.target]);
            return;
        }
    };
}