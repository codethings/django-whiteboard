import { Board } from "../board";
import { ModeHandler } from "../types";


export default class DrawHandler implements ModeHandler {
    constructor(private board: Board) { }
    processAddedShape = () => {}
    enter = () => {
        this.board.stage.on("mousedown", this.onMouseDown);
        this.board.stage.on("mouseup", this.onMouseUp);
        this.board.stage.on("mousemove", this.onMouseMove);
        this.board.stage.on("mouseleave", this.onMouseUp);
        this.board.container.classList.add("line");
    };
    exit = () => {
        this.board.stage.off("mousedown", this.onMouseDown);
        this.board.stage.off("mouseup", this.onMouseUp);
        this.board.stage.off("mousemove", this.onMouseMove);
        this.board.stage.off("mouseleave", this.onMouseUp);
        this.board.container.classList.remove("line");
    };
    onMouseDown = () => {
        const { board } = this;
        const { x, y } = board.stage.getRelativePointerPosition();
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
        const { x, y } = board.stage.getRelativePointerPosition();
        if (!board.currentDrawingObject)
            return;
        if (board.currentDrawingObject.type === "path") {
            board.currentDrawingObject.points.push([x, y]);
        }
        board.draw();
    };
}
