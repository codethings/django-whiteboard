import Konva from "konva";
import { BoardObject } from "./types";

export function objToKonva(obj: BoardObject) {
  switch (obj.type) {
    case "path":
      return new Konva.Line({
        points: obj.points.reduce((acc, coord) => [...acc, ...coord], []),
        stroke: "black",
      });
    default:
      throw new Error("Don't know how to convert");
  }
}
