import { useEffect, useRef, useState } from "react";
import { useLibraryStore } from "../store/library";
import { useFocusContext } from "../context/FocusContext";

const useFocusable = () => {
  const ref = useRef(null);
  const [focusId, setFocusId] = useState(Number(new Date()));
  const { focusItems, addFocusItem, removeFocusItem } = useLibraryStore();
  const parentKey = useFocusContext();

  // Sync focus item with store
  useEffect(() => {
    if (!(focusId in focusItems)) {
      addFocusItem(focusId, { parent: parentKey });
    }

    return () => {
      removeFocusItem(focusId);
    };
  }, [focusId, addFocusItem, removeFocusItem, focusItems, parentKey]);

  return {
    ref,
    focusId,
  };
};

export default useFocusable;
