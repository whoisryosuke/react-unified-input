export type Vector2D = {
  x: number;
  y: number;
};

export type FocusId = number;
export type FocusItem = {
  parent: FocusId;
  position: DOMRect;
};
