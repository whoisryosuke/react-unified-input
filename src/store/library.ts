import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { FocusId, FocusItem } from "../types";
// import type {} from "@redux-devtools/extension"; // required for devtools typing

interface LibraryState {
  focusItems: Record<FocusId, FocusItem>;

  addFocusItem: (focusId: FocusId, focusItem: FocusItem) => void;
  removeFocusItem: (focusId: FocusId) => void;
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
  }))
);
