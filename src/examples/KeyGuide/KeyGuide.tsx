import React, { useEffect, useState } from "react";
import { useFocusStore } from "../../store/library";
import { UserInputKeys } from "../../constants/input";

type Props = {
  input: UserInputKeys;
};

const KeyGuide = ({ input }: Props) => {
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const { currentDevice, keyboardMap, gamepadMap } = useFocusStore();

  useEffect(() => {
    const currentMap = currentDevice === "KEYBOARD" ? keyboardMap : gamepadMap;
    const hasCurrentKey = Object.entries(currentMap).find(
      ([_, inputKey]) => inputKey == input
    );
    if (hasCurrentKey) {
      const newKey = hasCurrentKey[0];
      if (currentKey !== newKey) setCurrentKey(newKey);
    }
  }, [currentDevice, input]);

  return (
    <div style={{ marginRight: 16 }}>
      {currentKey && (
        <p>
          <strong>{input}</strong>: {currentKey}
        </p>
      )}
    </div>
  );
};

export default KeyGuide;
