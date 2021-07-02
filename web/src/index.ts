import ReconnectingWebSocket from "reconnecting-websocket";

type Point = [number, number];

type BoardPath = {
  type: "path";
  points: Point[];
};

type BoardObject = BoardPath;

type ReceivedWebsocketMessage =
  | {
      type: "INITIAL_DATA";
      data: {
        objects: BoardObject[];
      };
    }
  | {
      type: "ADD_OBJECT";
      data: { object: BoardObject };
    };

function generateId() {
  // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  return Math.random().toString(36).substring(7);
}

class Board {
  objects: BoardObject[] = [];
  currentDrawingObject?: BoardObject;
  context: CanvasRenderingContext2D;
  elementPosition: Point;
  socket: ReconnectingWebSocket;
  sendingObjects = new Map<string, BoardObject>();
  sessionId = generateId();
  constructor(private element: HTMLCanvasElement, private boardId: string) {
    this.context = element.getContext("2d");
    const { x, y } = element.getBoundingClientRect();
    this.elementPosition = [x, y];
    const scheme = window.location.protocol === "http:" ? "ws" : "wss";
    this.socket = new ReconnectingWebSocket(
      `${scheme}://${window.location.host}/board/${this.boardId}?sessionId=${this.sessionId}`
    );
    this.socket.addEventListener("message", this.onSocketMessage);
  }
  onSocketMessage = (event: MessageEvent) => {
    const data = event.data;
    const payload = JSON.parse(data) as ReceivedWebsocketMessage;
    if (payload.type === "INITIAL_DATA") {
      this.objects = payload.data.objects;
      this.draw();
    } else if (payload.type === "ADD_OBJECT") {
      this.objects.push(payload.data.object);
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
      this.objects.push(obj);
    } catch (error) {
      console.error(error)
    }
    this.sendingObjects.delete(id);
    this.draw();
  };
  onMouseDown = (event: MouseEvent) => {
    console.log(event);
    const x = event.clientX - this.elementPosition[0];
    const y = event.clientY - this.elementPosition[1];
    this.currentDrawingObject = {
      type: "path",
      points: [[x, y]],
    };
    this.draw();
  };
  onMouseUp = () => {
    if (this.currentDrawingObject) {
      this.sendCurrentDrawingObject();
      this.draw();
    }
  };
  onMouseMove = (event: MouseEvent) => {
    const x = event.clientX - this.elementPosition[0];
    const y = event.clientY - this.elementPosition[1];
    if (!this.currentDrawingObject) return;
    if (this.currentDrawingObject.type === "path") {
      this.currentDrawingObject.points.push([x, y]);
    }
    this.draw();
  };
  draw = () => {
    const { context, element } = this;
    const { width, height } = element.getBoundingClientRect();
    context.clearRect(0, 0, width, height);
    for (const obj of this.objects) {
      this.drawObject(obj);
    }
    if (this.currentDrawingObject) {
      this.drawObject(this.currentDrawingObject);
    }
    for (const obj of this.sendingObjects.values()) {
      this.drawObject(obj, {inflight: true});
    }
  };
  drawObject = (obj: BoardObject, options: {inflight: boolean} = {inflight: false}) => {
    if (obj.type === "path") {
      this.drawPath(obj, options);
    }
  };
  drawPath = (obj: BoardPath, options: {inflight: boolean}) => {
    if (obj.points.length === 0) return;
    const context = this.context;
    context.closePath();
    context.beginPath();
    if (options.inflight) {
      context.strokeStyle = "red";
    } else {
      context.strokeStyle = "black";
    }
    context.lineWidth = 1;
    const firstPoint = obj.points[0];
    const rest = obj.points.slice(1);
    context.moveTo(firstPoint[0], firstPoint[1]);
    for (const point of rest) {
      const [x, y] = point;
      context.lineTo(x, y);
    }
    context.stroke();
  };
  run = () => {
    this.element.addEventListener("mousedown", this.onMouseDown);
    this.element.addEventListener("mouseup", this.onMouseUp);
    this.element.addEventListener("mousemove", this.onMouseMove);
    this.element.addEventListener("mouseleave", this.onMouseUp);
    this.draw();
  };
}

const element = document.getElementById("foo") as HTMLCanvasElement;
const board = new Board(element, (window as any).boardId);
board.run();


// @ts-ignore
window.board = board