export type Vector2D = {
  x: number;
  y: number;
};

export type FocusId = string;
export type FocusItem = {
  parent: FocusId;
  position: DOMRect;
  focusable: boolean;
  isParent: boolean;
  rememberFocus: boolean;
};

export type FocusItems = Record<FocusId, FocusItem>;
// These are focus items that we use `Object.entries()`
export type FocusItemMapItem = [FocusId, FocusItem];
export type FocusItemMap = FocusItemMapItem[];

export type LastFocusedItems = Record<FocusId, FocusId>;

export interface FocusConfig {
  removeFocusOnHover: boolean;
  debugLog: boolean;
}
