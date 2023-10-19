import { useEffect, useRef, useState } from "react";
import { useLibraryStore } from "../store/library";
import { useFocusContext } from "../context/FocusContext";
import { FocusId } from "../types";

const useFocusable = (focusName: FocusId) => {
  const ref = useRef<HTMLElement>(null);
  const [focusId, setFocusId] = useState(
    focusName ?? Number(new Date()).toString()
  );
  const {
    focusItems,
    focusedItem,
    addFocusItem,
    removeFocusItem,
    setFocusPosition,
  } = useLibraryStore();
  const parentKey = useFocusContext();
  const focused = focusedItem === focusId;
  console.log("focus items", focusItems);

  const getPosition = () => {
    if (ref.current && window) {
      const position = ref.current.getBoundingClientRect();
      return position;
    }
  };

  // Sync focus item with store
  useEffect(() => {
    console.log("syncing focus position with store", focusId);
    if (!(focusId in focusItems)) {
      console.log("focus not found, syncing");
      // Get position
      const position = getPosition();
      if (!position) {
        // throw new Error(`Couldn't find element position for focus ${focusId}`);
        return;
      }
      addFocusItem(focusId, { parent: parentKey, position });
    }
  }, [focusId, addFocusItem, removeFocusItem, focusItems, parentKey]);

  // If we unmount, remove focus item from store
  useEffect(() => {
    return () => {
      console.log("unmounting focus", focusId);
      removeFocusItem(focusId);
    };
  }, [focusId, removeFocusItem]);

  // Sync position
  // useEffect(() => {
  //   console.log("initial render - getting position", focusId);
  //   // Get position
  //   const position = getPosition();
  //   if (position) {
  //     console.log("initial - position", focusId, position);
  //     setFocusPosition(focusId, position);
  //   }
  // }, [ref, focusId, setFocusPosition]);

  return {
    ref,
    focusId,
    focused,
  };
};

export default useFocusable;
