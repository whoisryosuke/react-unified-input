import React from "react";
import KeyboardInput from "./Keyboard";
import Navigator from "./Navigator";

type Props = {};

const InputManager = (props: Props) => {
  return (
    <>
      <Navigator />
      <KeyboardInput />
    </>
  );
};

export default InputManager;
