import Konva from "konva";
import { throttle } from "lodash";
import { Board } from "./board";
import { RemoteCursor } from "./types";


function getHue(sessionId: string) {
  const textEncoder = new TextEncoder();
  return (textEncoder.encode(sessionId)[0] - 97) / (122 - 97);
}

class CursorService {
  cursorLayer = new Konva.Layer({ listening: false });
  remoteCursors: { [key: string]: RemoteCursor } = {};
  remoteCursorShapes: { [key: string]: Konva.Group } = {};
  constructor(private board: Board) {}
  init() {
    this.board.stage.add(this.cursorLayer);
    this.drawAllRemoteCursors();
    this.onStageZoomChange();
    this.board.stage.on("mousemove", this.onMouseMove);
    this.board.stage.on("mouseleave", this.onMouseLeave);
  }
  destory() {
    this.cursorLayer.destroy();
  }
  setCursor = (cursor: RemoteCursor) => {
    this.remoteCursors[cursor.sessionId] = cursor;
    this.drawRemoteCursor(cursor);
  };
  _onMouseMove = () => {
    const position = this.board.stage.getRelativePointerPosition();
    const sessionId = this.board.sessionId;
    this.board.socket.send(
      JSON.stringify({
        type: "SET_CURSOR",
        data: { sessionId, position },
      })
    );
  };
  onMouseLeave = () => {
    const sessionId = this.board.sessionId;
    this.board.socket.send(
      JSON.stringify({
        type: "SET_CURSOR",
        data: { sessionId },
      })
    );
    this.onMouseMove.cancel();
  };
  onMouseMove = throttle(this._onMouseMove, 300, { trailing: true });
  onStageZoomChange = () => {
    const scale = this.board.stage.scale();
    Object.values(this.remoteCursorShapes).forEach((cursorNode) => {
      cursorNode.scale({
        x: 1 / scale.x,
        y: 1 / scale.y,
      });
    });
  };
  drawRemoteCursor = (cursor: RemoteCursor) => {
    let cursorNode = this.remoteCursorShapes[cursor.sessionId];
    if (!cursor.position && cursorNode) {
        cursorNode.remove();
        return;
    } else if (!cursor.position) {
      return;
    }
    if (!cursorNode) {
      cursorNode = new Konva.Group();
      const color = `hsl(${getHue(cursor.sessionId)}turn 31% 50%)`
      console.log(color)
      cursorNode.add(
        new Konva.Path({
          data: "M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z",
          fill: color,
          stroke: color,
          scale: { x: 0.8, y: 0.8 },
        }),
        new Konva.Path({
          data: "M13 13l6 6",
          stroke: color,
          scale: { x: 0.8, y: 0.8 },
        })
      );
      const stageScale = this.board.stage.scale();
      cursorNode.scale({
        x: 1 / stageScale.x,
        y: 1 / stageScale.y,
      });
      this.remoteCursorShapes[cursor.sessionId] = cursorNode;
      cursorNode.position(cursor.position);
    }
    if (cursorNode.getParent() !== this.cursorLayer as unknown) {
      this.cursorLayer.add(cursorNode);
    }
    const tween = new Konva.Tween({
      node: cursorNode,
      x: cursor.position.x,
      y: cursor.position.y,
      duration: 0.3,
    });
    tween.play();
  };
  drawAllRemoteCursors = () => {
    Object.values(this.remoteCursors).forEach((c) => this.drawRemoteCursor(c));
  };
}

export default CursorService;
