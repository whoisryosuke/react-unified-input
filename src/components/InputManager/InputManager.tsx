import KeyboardInput from "./Keyboard";
import Navigator from "./Navigator";
import { GamepadInput } from "./Gamepad";

type Props = {
  disableGamepad?: boolean;
  disableKeyboard?: boolean;
  disableNavigation?: boolean;
};

const InputManager = ({
  disableGamepad,
  disableKeyboard,
  disableNavigation,
}: Props) => {
  return (
    <>
      {!disableNavigation && <Navigator />}
      {!disableKeyboard && <KeyboardInput />}
      {!disableGamepad && <GamepadInput />}
    </>
  );
};

InputManager.defaultProps = {
  disableGamepad: false,
  disableKeyboard: false,
  disableNavigation: false,
};

export default InputManager;
