import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { FocusId, FocusItem } from "../types";
import {
  UserInputMap,
  UserInputKeys,
  DEFAULT_USER_INPUT,
  DEFAULT_KEYBOARD_MAP,
  UserInputDeviceKeys,
  DEFAULT_GAMEPAD_MAP,
} from "../constants/input";
// import type {} from "@redux-devtools/extension"; // required for devtools typing

interface FocusConfig {
  removeFocusOnHover: boolean;
}

const DEFAULT_FOCUS_CONFIG: FocusConfig = {
  removeFocusOnHover: false,
};

interface LibraryState {
  // Config
  focusConfig: FocusConfig;
  setFocusConfig: (config: Partial<FocusConfig>) => void;

  // Focus
  focusedItem: FocusId;
  focusItems: Record<FocusId, FocusItem>;
  addFocusItem: (focusId: FocusId, focusItem: FocusItem) => void;
  setFocusedItem: (focusId: FocusId) => void;
  removeFocusItem: (focusId: FocusId) => void;
  setFocusPosition: (focusId: FocusId, position: FocusItem["position"]) => void;

  // Input
  input: UserInputMap;
  setInput: (key: UserInputKeys, input: boolean) => void;
  setInputs: (inputs: Partial<UserInputMap>) => void;
  keyboardMap: UserInputDeviceKeys;
  gamepadMap: UserInputDeviceKeys;
  setKeyboardMap: (map: UserInputDeviceKeys) => void;
  setGamepadMap: (map: UserInputDeviceKeys) => void;
}

export const useFocusStore = create<LibraryState>()(
  devtools((set) => ({
    focusConfig: DEFAULT_FOCUS_CONFIG,
    setFocusConfig: (focusConfig) =>
      set((state) => ({
        focusConfig: { ...state.focusConfig, ...focusConfig },
      })),

    focusedItem: "",
    focusItems: {},
    addFocusItem: (focusId, focusItem) =>
      set((state) => ({
        focusItems: { ...state.focusItems, [focusId]: focusItem },
      })),
    setFocusedItem: (focusId) =>
      set(() => ({
        focusedItem: focusId,
      })),
    removeFocusItem: (focusId) =>
      set((state) => {
        const { [focusId]: _, ...focusItems } = state.focusItems;
        return {
          focusItems,
        };
      }),
    setFocusPosition: (focusId, position) =>
      set((state) => ({
        focusItems: {
          ...state.focusItems,
          [focusId]: {
            ...state.focusItems[focusId],
            position,
          },
        },
      })),

    input: DEFAULT_USER_INPUT,
    setInput: (key, input) =>
      set((state) => ({ input: { ...state.input, [key]: input } })),
    setInputs: (inputs) =>
      set((state) => ({ input: { ...state.input, ...inputs } })),

    keyboardMap: DEFAULT_KEYBOARD_MAP,
    gamepadMap: DEFAULT_GAMEPAD_MAP,
    setKeyboardMap: (keyboardMap) => set(() => ({ keyboardMap })),
    setGamepadMap: (gamepadMap) => set(() => ({ gamepadMap })),
  }))
);
