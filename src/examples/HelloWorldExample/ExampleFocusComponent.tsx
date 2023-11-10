import React, { useEffect } from "react";
import useFocusable from "../../hooks/useFocusable";
import { useLibraryStore } from "../../store/library";

type Props = {
  initialFocus?: boolean;
};

const ExampleFocusComponent = ({ initialFocus = false }: Props) => {
  const { ref, focusId, focused } = useFocusable();
  const { setFocusedItem } = useLibraryStore();

  // Initially focus
  useEffect(() => {
    initialFocus && setFocusedItem(focusId);
  }, []);

  return (
    <button
      ref={ref}
      style={{ backgroundColor: focused ? "blue" : "transparent" }}
      onClick={() => console.log("button pressed!")}
    >
      Focusable Component
    </button>
  );
};

export default ExampleFocusComponent;
