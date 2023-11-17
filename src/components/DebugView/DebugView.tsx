import React from "react";
import { useFocusStore } from "../..";

type Props = React.HTMLAttributes<HTMLDivElement>;

const DebugView = (props: Props) => {
  const { focusItems } = useFocusStore();

  const renderItems = Object.entries(focusItems).map(([key, focusItem]) => {
    return (
      <div
        key={key}
        style={{
          position: "absolute",
          top: focusItem.position.y,
          left: focusItem.position.x,
          width: focusItem.position.width,
          height: focusItem.position.height,

          // Debug styling
          border: "2px solid teal",
        }}
        {...props}
      ></div>
    );
  });

  return (
    <div
      style={{
        position: "fixed",
        width: "100vw",
        height: "100vh",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    >
      {renderItems}
    </div>
  );
};

export default DebugView;
