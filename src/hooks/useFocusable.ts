import { useEffect, useRef, useState } from "react";
import { useLibraryStore } from "../store/library";
import { useFocusContext } from "../context/FocusContext";

const useFocusable = () => {
  const ref = useRef<HTMLElement>(null);
  const [focusId, setFocusId] = useState(Number(new Date()));
  const { focusItems, addFocusItem, removeFocusItem, setFocusPosition } =
    useLibraryStore();
  const parentKey = useFocusContext();

  const getPosition = () => {
    if (ref.current && window) {
      const position = ref.current.getBoundingClientRect();
      return position;
    }
  };

  // Sync focus item with store
  useEffect(() => {
    if (!(focusId in focusItems)) {
      // Get position
      const position = getPosition();
      if (!position) {
        throw new Error(`Couldn't find element position for focus ${focusId}`);
      }
      addFocusItem(focusId, { parent: parentKey, position });
    }

    return () => {
      removeFocusItem(focusId);
    };
  }, [focusId, addFocusItem, removeFocusItem, focusItems, parentKey]);

  // Sync position
  useEffect(() => {
    // Get position
    const position = getPosition();
    if (position) {
      setFocusPosition(focusId, position);
    }
  }, [ref, focusId, setFocusPosition]);

  return {
    ref,
    focusId,
  };
};

export default useFocusable;
