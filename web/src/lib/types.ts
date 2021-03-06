import Konva from "konva";
import { Vector2d } from "konva/lib/types";

export type Point = [number, number];

export type BoardPath = {
  type: "path";
  points: Point[];
};

export type BoardObjectAttrs = {
  transform?: Konva.Transform["m"];
};
export type BoardObject = BoardPath & { id?: string } & BoardObjectAttrs;

export type ReceivedWebsocketMessage =
  | {
      type: "INITIAL_DATA";
      data: {
        objects: BoardObject[];
      };
    }
  | {
      type: "ADD_OBJECT";
      data: { object: BoardObject };
    }
  | {
      type: "SET_OBJECTS_ATTRS";
      data: { objectsAttrs: { [key: string]: BoardObjectAttrs } };
    }
  | {
      type: "SET_CURSOR";
      data: RemoteCursor;
    }
  | {
      type: "REMOVE_OBJECTS";
      data: { removedObjectIds: string[] };
    };

export type ModeHandler = {
  enter: () => void;
  exit: () => void;
  processAddedShape?: (shape: Konva.Shape) => void;
};

export enum BoardMode {
  DRAW = "draw",
  SELECT = "select",
  MOVE = "move",
}

export type RemoteCursor = {
  sessionId: string;
  position?: Vector2d;
};
