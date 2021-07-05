import ReconnectingWebSocket from "reconnecting-websocket";
import Konva from "konva";
import { BoardObject, ReceivedWebsocketMessage, BoardPath, BoardMode, ModeHandler } from "./types";
import { objToKonva } from "./convert";
import { KonvaEventObject } from "konva/lib/Node";

import "./styles/index.scss"
import { DrawHandler } from "./handlers";


function generateId() {
  // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  return Math.random().toString(36).substring(7);
}

export class Board {
  stage: Konva.Stage;
  layer = new Konva.Layer({});
  drawingLayer = new Konva.Layer();
  pendingLayer = new Konva.Layer();
  trLayer = new Konva.Layer();
  tr = new Konva.Transformer();
  currentDrawingObject?: BoardObject;
  socket: ReconnectingWebSocket;
  sendingObjects = new Map<string, BoardObject>();
  sessionId = generateId();
  mode = BoardMode.DRAW;
  modeHandlers: {[k in BoardMode]: ModeHandler} = {
    [BoardMode.DRAW]: new DrawHandler(this),
    [BoardMode.SELECT]: new DrawHandler(this),
  }
  constructor(private container: HTMLDivElement, private boardId: string) {
    this.stage = new Konva.Stage({
      container: this.container,
      width: 600,
      height: 600,
    });
    this.stage.add(this.layer);
    this.stage.add(this.drawingLayer);
    this.stage.add(this.pendingLayer);
    this.stage.add(this.trLayer);
    this.trLayer.add(this.tr);
    this.layer.draw();
    const scheme = window.location.protocol === "http:" ? "ws" : "wss";
    this.socket = new ReconnectingWebSocket(
      `${scheme}://${window.location.host}/board/${this.boardId}?sessionId=${this.sessionId}`
    );
    this.socket.addEventListener("message", this.onSocketMessage);
    this.changeMode(BoardMode.DRAW);
  }
  changeMode = (mode: BoardMode) => {
    const modeHandler = this.modeHandlers[mode];
    const currentModeHandler = this.modeHandlers[this.mode];
    currentModeHandler.exit();
    modeHandler.enter();
    this.mode = mode;
  }
  onSocketMessage = (event: MessageEvent) => {
    const data = event.data;
    const payload = JSON.parse(data) as ReceivedWebsocketMessage;
    if (payload.type === "INITIAL_DATA") {
      for (const obj of payload.data.objects) {
        this.layer.add(objToKonva(obj))
      }
      this.draw();
    } else if (payload.type === "ADD_OBJECT") {
      this.layer.add(objToKonva(payload.data.object));
      this.draw();
    }
  };
  sendBoardObject = async (obj: BoardObject, id: string) => {
    return fetch("/add-object", {
      method: "POST",
      body: JSON.stringify({
        boardId: this.boardId,
        objectData: obj,
      }),
      headers: {
        "Content-Type": "application/json",
        "session-id": this.sessionId,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Not ok");
        return response.json();
      })
  };
  sendCurrentDrawingObject = async () => {
    const obj = this.currentDrawingObject;
    this.currentDrawingObject = null;
    const id = generateId();
    try {
      this.sendingObjects.set(id,obj);
      await this.sendBoardObject(obj, id);
      this.layer.add(objToKonva(obj));
    } catch (error) {
      console.error(error)
    }
    this.sendingObjects.delete(id);
    this.draw();
  };
  
  draw = () => {
    // this.layer.draw();
    this.drawingLayer.destroyChildren();
    this.pendingLayer.destroyChildren();
    if (this.currentDrawingObject) {
      this.drawingLayer.add(objToKonva(this.currentDrawingObject))
    }
    if (this.pendingLayer) {
    for (const obj of this.sendingObjects.values()) {
      const line = objToKonva(obj);
      line.stroke("red");
      this.pendingLayer.add(line);
    }
    }
  };
  run = () => {
    this.draw();
  };
}

const element = document.getElementById("container") as HTMLDivElement;
const board = new Board(element, (window as any).boardId);
board.run();


// @ts-ignore
window.board = board