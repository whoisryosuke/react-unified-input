export const DEFAULT_USER_INPUT = {
  up: false,
  down: false,
  left: false,
  right: false,
  confirm: false,
  cancel: false,
};

/**
 * The main input map we use at a core level. All devices update this state.
 */
export type UserInputMap = typeof DEFAULT_USER_INPUT;

/**
 * The keys for the main input map
 */
export type UserInputKeys = keyof typeof DEFAULT_USER_INPUT;

/**
 * Used when mapping device "button" to the input map.
 * We store using the device "button" as the object key for quick lookup
 */
export type UserInputDeviceKeys = Record<string, UserInputKeys>;

export const DEFAULT_KEYBOARD_MAP: UserInputDeviceKeys = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Enter: "confirm",
  Escape: "cancel",
};

// Gamepad uses array index based keys.
export const DEFAULT_GAMEPAD_MAP: UserInputDeviceKeys = {
  12: "up",
  13: "down",
  14: "left",
  15: "right",
  3: "confirm",
  1: "cancel",
};

export type InputDevices = "KEYBOARD" | "GAMEPAD" | "CUSTOM";
