import { useCallback, useEffect, useRef, useState } from "react";
import { useLibraryStore } from "../store/library";
import { useFocusContext } from "../context/FocusContext";
import { FocusId } from "../types";

const generateId = () =>
  `${Number(new Date()).toString()}-${Math.round(Math.random() * 100000)}`;

type UseFocusableProps = {
  focusName: FocusId;
};

const DEFAULT_USE_FOCUSABLE_PROPS = {
  focusName: "",
};

const useFocusable = ({
  focusName,
}: UseFocusableProps = DEFAULT_USE_FOCUSABLE_PROPS) => {
  const ref = useRef<HTMLElement>(null);
  const [focusId, setFocusId] = useState(
    focusName !== "" ? focusName : generateId()
  );
  const focusAdded = useRef(false);
  const {
    focusConfig,
    focusItems,
    focusedItem,
    addFocusItem,
    removeFocusItem,
    setFocusedItem,
    setFocusPosition,
  } = useLibraryStore();
  const parentKey = useFocusContext();
  const focused = focusedItem === focusId;

  const getPosition = () => {
    if (ref.current && window) {
      const position = ref.current.getBoundingClientRect();
      return position;
    }
  };

  // Sync focus item with store
  useEffect(() => {
    console.log(
      "syncing focus position with store",
      focusId,
      focusAdded.current
    );

    // If we already added it, don't add again
    if (focusAdded.current) return;

    // Check if focus name exists, if so, make a new one
    // Ideally this will run again
    if (focusId in focusItems) {
      console.log("duplicate ID found, generating new one");
      return setFocusId(generateId());
    }
    console.log("focus not found, syncing");
    // Get position
    const position = getPosition();
    if (!position) {
      console.error("couldnt get position");
      // throw new Error(`Couldn't find element position for focus ${focusId}`);
      return;
    }
    console.log("adding to focus store", focusId);
    addFocusItem(focusId, { parent: parentKey, position });
    focusAdded.current = true;
  }, [focusId, addFocusItem, removeFocusItem, focusItems, parentKey]);

  // If we unmount, remove focus item from store
  useEffect(() => {
    return () => {
      console.log("unmounting focus", focusId);
      removeFocusItem(focusId);
      focusAdded.current = false;
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

  // Add hover events to the element
  const handleHoverEnter = useCallback(() => {
    if (!focused) setFocusedItem(focusId);
  }, [focusId, setFocusedItem, focused]);
  const handleHoverExit = useCallback(() => {
    if (focused && focusConfig.removeFocusOnHover) setFocusedItem("");
  }, [focusConfig.removeFocusOnHover, focused, setFocusedItem]);
  // TODO: Disable for native?
  useEffect(() => {
    const focusElement = ref.current;
    if (!focusElement) return;
    focusElement.addEventListener("mouseenter", handleHoverEnter);
    focusElement.addEventListener("mouseleave", handleHoverExit);

    return () => {
      focusElement.removeEventListener("mouseenter", handleHoverEnter);
      focusElement.removeEventListener("mouseleave", handleHoverExit);
    };
  }, [handleHoverEnter, handleHoverExit]);

  return {
    ref,
    focusId,
    focused,
  };
};

export default useFocusable;
