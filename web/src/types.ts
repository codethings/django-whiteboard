export type Point = [number, number];

export type BoardPath = {
  type: "path";
  points: Point[];
};

export type BoardObject = BoardPath;

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
    };

export type ModeHandler = {
  enter: () => void;
  exit: () => void;
};

export enum BoardMode {
  DRAW = "draw",
  SELECT = "select",
}
