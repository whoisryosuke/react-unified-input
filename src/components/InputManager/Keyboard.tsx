import { useEffect } from "react";
import { useFocusStore } from "../../store/library";

const KeyboardInput = () => {
  const {
    keyboardMap,
    setInput,
    currentDevice,
    setCurrentDevice,
    setDeviceName,
  } = useFocusStore();

  // If pressed key is our target key then set to true
  function downHandler({ key }: KeyboardEvent): void {
    console.log("key down", key, keyboardMap, key in keyboardMap);
    if (key in keyboardMap) {
      const inputKey = keyboardMap[key];
      console.log("setting input", inputKey, true);
      setInput(inputKey, true);
      if (currentDevice !== "KEYBOARD") {
        setCurrentDevice("KEYBOARD");
        setDeviceName("Keyboard");
      }
    }
  }
  // If released key is our target key then set to false
  const upHandler = ({ key }: KeyboardEvent): void => {
    if (key in keyboardMap) {
      const inputKey = keyboardMap[key];
      setInput(inputKey, false);
    }
  };
  useEffect(() => {
    if (typeof window == "undefined") return;
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []);

  return <></>;
};

export default KeyboardInput;
