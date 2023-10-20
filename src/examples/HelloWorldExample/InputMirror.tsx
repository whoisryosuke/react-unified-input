import React from "react";
import { useLibraryStore } from "../../store/library";

type Props = {};

const InputMirror = (props: Props) => {
  const { input } = useLibraryStore();

  const inputMap = Object.entries(input).map(([key, value]) => {
    return (
      <div style={{ display: "flex", alignContent: "center" }}>
        <span style={{ color: "rgba(0,0,0,0.7)", marginRight: "8px" }}>
          {key}:
        </span>
        <strong
          style={{
            display: "inline-block",
            minWidth: "4em",
            minHeight: "1em",
            padding: "2px 4px",
            backgroundColor: value ? "blue" : "rgba(0,0,0,0.3)",
            color: "white",
            marginBottom: "4px",
          }}
        >
          {value && "PRESSED"}
        </strong>
      </div>
    );
  });
  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        fontSize: "12px",
      }}
    >
      {inputMap}
    </div>
  );
};

export default InputMirror;
