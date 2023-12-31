import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusStore } from "../store/library";
import { useFocusContext } from "../context/FocusContext";
import { FocusId } from "../types";

const generateId = () =>
  `${Number(new Date()).toString()}-${Math.round(Math.random() * 100000)}`;

type UseFocusableProps = {
  focusName: FocusId;
  focusable: boolean;
};

const DEFAULT_USE_FOCUSABLE_PROPS = {
  focusName: "",
  focusable: true,
};

function useFocusable<T extends HTMLElement>(
  userConfig: Partial<UseFocusableProps> = DEFAULT_USE_FOCUSABLE_PROPS
) {
  // Since it's a `Parial<>` - fill in gaps with default data
  const config = {
    ...DEFAULT_USE_FOCUSABLE_PROPS,
    ...userConfig,
  };
  const { focusName, focusable } = config;

  // The focus element ref
  const ref = useRef<T>(null);
  const [focusId, setFocusId] = useState(
    focusName && focusName !== "" ? focusName : generateId()
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
    input,
  } = useFocusStore();
  const parentKey = useFocusContext();
  const focused = focusedItem === focusId;

  const getPosition = () => {
    if (ref.current && window) {
      const position = ref.current.getBoundingClientRect();
      return position;
    }
  };

  const updatePosition = useCallback(() => {
    // Update the item position in case it changes on hover
    const position = getPosition();
    if (position) setFocusPosition(focusId, position);
  }, [focusId, setFocusPosition]);

  const focusSelf = () => {
    setFocusedItem(focusId);
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
    addFocusItem(focusId, { parent: parentKey, position, focusable });
    ref.current?.setAttribute("focus-id", focusId);
    focusAdded.current = true;
  }, [
    focusId,
    addFocusItem,
    removeFocusItem,
    focusItems,
    parentKey,
    focusable,
  ]);

  // If we unmount, remove focus item from store
  useEffect(() => {
    return () => {
      console.log("unmounting focus", focusId);
      removeFocusItem(focusId);
      ref.current?.removeAttribute("focus-id");
      focusAdded.current = false;
    };
  }, [focusId, removeFocusItem]);

  // Add mouse hover events to the element
  const handleHoverEnter = useCallback(() => {
    updatePosition();
    // Focus the item if it's not already
    if (!focused) setFocusedItem(focusId);
  }, [focusId, setFocusedItem, updatePosition, focused]);
  const handleHoverExit = useCallback(() => {
    updatePosition();
    // Unfocus the item. It's a special config mode.
    if (focused && focusConfig.removeFocusOnHover) setFocusedItem("");
  }, [focusConfig.removeFocusOnHover, focused, updatePosition, setFocusedItem]);
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

  // Check for "confirm" input to run onClick event for focused element
  // TODO: Add an interval to handled "press and hold" events
  useEffect(() => {
    if (focused && input.confirm) {
      const focusElement = ref.current;
      if (!focusElement) return;
      if (typeof focusElement.onclick == "function") {
        focusElement.click();
      }
    }
  }, [focused, input.confirm]);

  // a11y: If element is focused in system - reflect on platform if possible
  // In this case, we use the DOM's `focus()` method on the element ref
  useEffect(() => {
    if (focused) {
      const focusElement = ref.current;
      if (!focusElement) return;
      focusElement.focus();
      console.log("element focused", focusElement);
    }
  }, [focused]);

  // a11y: Check if focus with DOM is out of sync (like tab navigation)
  const handleFocus = useCallback(() => {
    console.log("checking DOM focus");
    const focusElement = ref.current;
    if (!focusElement) return;
    if (document.activeElement == focusElement && !focused) {
      console.log("element is focused in DOM - but not in system");
      setFocusedItem(focusId);
    }
  }, [focusId, setFocusedItem, focused]);

  useEffect(() => {
    const focusElement = ref.current;
    if (!focusElement) return;
    focusElement.addEventListener("focus", handleFocus);

    return () => {
      focusElement.removeEventListener("focus", handleFocus);
    };
  }, [handleFocus]);

  return {
    ref,
    focusId,
    focused,
    focusSelf,
    updatePosition,
  };
}

export default useFocusable;
