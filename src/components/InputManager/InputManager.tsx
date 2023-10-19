import React from "react";
import KeyboardInput from "./Keyboard";
import Navigator from "./Navigator";
import { useLibraryStore } from "../../store/library";

type Props = {};

const InputManager = (props: Props) => {
  const { focusItems } = useLibraryStore();
  console.log("focusItems", focusItems);
  return (
    <>
      <Navigator />
      <KeyboardInput />
    </>
  );
};

export default InputManager;
