import React from "react";
import KeyboardInput from "./Keyboard";
import Navigator from "./Navigator";
import { GamepadInput } from "./Gamepad";

type Props = {};

const InputManager = (props: Props) => {
  return (
    <>
      <Navigator />
      <KeyboardInput />
      <GamepadInput />
    </>
  );
};

export default InputManager;
