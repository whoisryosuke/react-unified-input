import React, { useEffect } from "react";
import { useLibraryStore } from "../../store/library";

type Props = {};

const KeyboardInput = (props: Props) => {
  const { keyboardMap, setInput } = useLibraryStore();

  // If pressed key is our target key then set to true
  function downHandler({ key }: KeyboardEvent): void {
    if (key in keyboardMap) {
      const inputKey = keyboardMap[key];
      setInput(inputKey, true);
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
