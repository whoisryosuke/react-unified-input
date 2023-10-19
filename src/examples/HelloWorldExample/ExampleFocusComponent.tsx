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
    <div
      ref={ref}
      style={{ backgroundColor: focused ? "blue" : "transparent" }}
    >
      Focusable Component
    </div>
  );
};

export default ExampleFocusComponent;
