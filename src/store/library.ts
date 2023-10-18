import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { FocusId, FocusItem } from "../types";
import {
  UserInputMap,
  UserInputKeys,
  DEFAULT_USER_INPUT,
  DEFAULT_KEYBOARD_MAP,
} from "../constants/input";
// import type {} from "@redux-devtools/extension"; // required for devtools typing

interface LibraryState {
  // Focus
  focusItems: Record<FocusId, FocusItem>;
  addFocusItem: (focusId: FocusId, focusItem: FocusItem) => void;
  removeFocusItem: (focusId: FocusId) => void;

  // Input
  input: UserInputMap;
  setInput: (key: UserInputKeys, input: boolean) => void;
  keyboardMap: UserInputDeviceKeys;
}

export const useLibraryStore = create<LibraryState>()(
  devtools((set) => ({
    focusItems: {},
    addFocusItem: (focusId, focusItem) =>
      set((state) => ({
        focusItems: { ...state.focusItems, [focusId]: focusItem },
      })),
    removeFocusItem: (focusId) =>
      set((state) => {
        const { [focusId]: _, ...focusItems } = state.focusItems;
        return {
          focusItems,
        };
      }),

    input: DEFAULT_USER_INPUT,
    setInput: (key, input) =>
      set((state) => ({ input: { ...state.input, [key]: input } })),

    keyboardMap: DEFAULT_KEYBOARD_MAP,
  }))
);
