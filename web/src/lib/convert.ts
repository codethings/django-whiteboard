import Konva from "konva";
import { BoardObject, BoardObjectAttrs } from "./types";

export function applyAttrs(node: Konva.Node, attrs: BoardObjectAttrs) {
  if (attrs.transform) {
    const transform = new Konva.Transform(attrs.transform);
    Object.entries(transform.decompose()).forEach(([k, v]) => {
      node[k](v);
    })
  }
  return node;
}

export function objToKonva(obj: BoardObject) {
  const commomProps = {id: obj.id}
  let shape: Konva.Shape | null = null;
  switch (obj.type) {
    case "path":
      shape = new Konva.Line({
        points: obj.points.reduce((acc, coord) => [...acc, ...coord], []),
        stroke: "black",
        ...commomProps
      });
    default:
      break
  }
  if (!shape) throw new Error("don't know how");
  applyAttrs(shape, obj);
  return shape;
}
