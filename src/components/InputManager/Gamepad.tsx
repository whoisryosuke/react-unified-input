import { useEffect, useRef } from "react";
import { useFocusStore } from "../../store/library";
import { UserInputMap } from "../../constants/input";

interface GamepadRef {
  [key: number]: Gamepad;
}

export function useGamepads() {
  const {
    input,
    gamepadMap,
    setInputs,
    currentDevice,
    setCurrentDevice,
    setDeviceName,
  } = useFocusStore();
  const gamepads = useRef<GamepadRef>([]);
  const requestRef = useRef<number>();

  const haveEvents =
    typeof window !== "undefined" && window && "ongamepadconnected" in window;

  const addGamepad = (gamepad: Gamepad) => {
    gamepads.current = {
      ...gamepads.current,
      [gamepad.index]: gamepad,
    };

    // Convert Gamepad input to generic input
    const gamepadMapArray = Object.keys(gamepadMap);

    // In order to prevent some unecessary re-renders,
    // we have a dirty check to see if any input has changed
    let dirtyInput = false;

    // Since this streams data, we need a way to turn that off when other devices are in use
    // We also check if any button was pressed at all
    // This confirms the gamepad is indeed in use
    let isPressed = false;

    // Input state to save to store later
    const newInput: Partial<UserInputMap> = {};

    gamepadMapArray.forEach((gamepadKey) => {
      const inputKey = gamepadMap[gamepadKey];
      const previousInput = input[inputKey];
      const currentInput = gamepad.buttons[parseInt(gamepadKey)].pressed;
      if (currentInput && !isPressed) isPressed = true;
      if (previousInput !== currentInput) {
        newInput[inputKey] = currentInput;
        dirtyInput = true;
      }
    });

    // Set device active
    if (currentDevice !== "GAMEPAD" && isPressed) {
      setCurrentDevice("GAMEPAD");
      setDeviceName(gamepad.id);
    }

    // If something was pressed - always update
    if (dirtyInput && (isPressed || currentDevice == "GAMEPAD")) {
      setInputs(newInput);
    }
  };

  /**
   * Adds game controllers during connection event listener
   * @param {object} e
   */
  const connectGamepadHandler = (e: GamepadEvent) => {
    console.log("[GAMEPAD] Connecting controller", e.gamepad);

    // Initially scans for input
    addGamepad(e.gamepad);
  };

  /**
   * Finds all gamepads and adds them to context
   */
  const scanGamepads = () => {
    // Grab gamepads from browser API
    const detectedGamepads = navigator.getGamepads
      ? navigator.getGamepads()
      : //   : navigator.webkitGetGamepads
        //   ? navigator.webkitGetGamepads()
        [];

    // Loop through all detected controllers and add if not already in state
    for (let i = 0; i < detectedGamepads.length; i++) {
      const newGamepads = detectedGamepads[i];
      if (newGamepads && newGamepads !== null) addGamepad(newGamepads);
    }
  };

  // Add event listener for gamepad connecting
  useEffect(() => {
    if (typeof window == "undefined") return;

    window.addEventListener("gamepadconnected", connectGamepadHandler);

    return window.removeEventListener(
      "gamepadconnected",
      connectGamepadHandler
    );
  });

  // Update each gamepad's status on each "tick"
  const syncGamepads = () => {
    if (!haveEvents) scanGamepads();
    requestRef.current = requestAnimationFrame(syncGamepads);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(syncGamepads);
    return () => cancelAnimationFrame(requestRef.current!);
  });

  //   return gamepads.current;
}

export const GamepadInput = () => {
  useGamepads();

  return <></>;
};
