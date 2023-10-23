import { useEffect, useRef } from "react";
import { useLibraryStore } from "../../store/library";
import { UserInputMap } from "../../constants/input";

interface GamepadRef {
  [key: number]: Gamepad;
}

export function useGamepads() {
  const { gamepadMap, setInputs } = useLibraryStore();
  const gamepads = useRef<GamepadRef>([]);
  const requestRef = useRef<number>();

  const haveEvents = window && "ongamepadconnected" in window;

  const addGamepad = (gamepad: Gamepad) => {
    gamepads.current = {
      ...gamepads.current,
      [gamepad.index]: gamepad,
    };

    // console.log("[GAMEPAD] Updating gamepad input");

    // Convert Gamepad input to generic input
    const gamepadMapArray = Object.keys(gamepadMap);
    const newInput: Partial<UserInputMap> = {};
    gamepadMapArray.forEach((gamepadKey) => {
      const inputKey = gamepadMap[gamepadKey];
      newInput[inputKey] = gamepad.buttons[gamepadKey].pressed;
    });
    setInputs(newInput);
  };

  /**
   * Adds game controllers during connection event listener
   * @param {object} e
   */
  const connectGamepadHandler = (e: GamepadEvent) => {
    console.log("[GAMEPAD] Connecting controller", e.gamepad);
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
