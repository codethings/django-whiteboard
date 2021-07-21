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
      cursorNode.add(
        new Konva.Path({
          data: "M302.189 329.126H196.105l55.831 135.993c3.889 9.428-.555 19.999-9.444 23.999l-49.165 21.427c-9.165 4-19.443-.571-23.332-9.714l-53.053-129.136-86.664 89.138C18.729 472.71 0 463.554 0 447.977V18.299C0 1.899 19.921-6.096 30.277 5.443l284.412 292.542c11.472 11.179 3.007 31.141-12.5 31.141z",
          fill: color,
          stroke: color,
          scale: { x: 0.04, y: 0.04 },
        }),
        // new Konva.Path({
        //   data: "M13 13l6 6",
        //   stroke: color,
        //   scale: { x: 0.8, y: 0.8 },
        // })
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
