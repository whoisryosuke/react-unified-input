export type Vector2D = {
  x: number;
  y: number;
};

export type FocusId = string;
export type FocusItem = {
  parent: FocusId;
  position: DOMRect;
  // This is primarily for parent/container elements
  // when you need to contain focus elements but dont need the container focusable
  focusable: boolean;
};
