import KeyboardInput from "./Keyboard";
import Navigator from "./Navigator";
import { GamepadInput } from "./Gamepad";
import { useEffect } from "react";
import { useFocusStore } from "../../store/library";
import { FocusConfig } from "../../types";

type Props = {
  disableGamepad?: boolean;
  disableKeyboard?: boolean;
  disableNavigation?: boolean;
  config?: Partial<FocusConfig>;
};

const InputManager = ({
  disableGamepad,
  disableKeyboard,
  disableNavigation,
  config,
}: Props) => {
  const { setFocusConfig } = useFocusStore();

  // Update internal store with new user configuration
  useEffect(() => {
    if (config) {
      setFocusConfig(config);
    }
  }, [config, setFocusConfig]);
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
