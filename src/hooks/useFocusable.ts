import { useEffect, useRef, useState } from "react";
import { useLibraryStore } from "../store/library";

const useFocusable = () => {
  const ref = useRef(null);
  const [focusId, setFocusId] = useState(Number(new Date()));
  const { focusItems, addFocusItem, removeFocusItem } = useLibraryStore();

  // Sync focus item with store
  useEffect(() => {
    if (!(focusId in focusItems)) {
      addFocusItem(focusId, { parent: 0 });
    }

    return () => {
      removeFocusItem(focusId);
    };
  }, [focusId, addFocusItem, removeFocusItem, focusItems]);

  return {
    ref,
    focusId,
  };
};

export default useFocusable;
