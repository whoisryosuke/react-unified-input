export type Vector2D = {
  x: number;
  y: number;
};

export type FocusId = string;
export type FocusItem = {
  parent: FocusId;
  position: DOMRect;
};
