import { useCallback, useEffect, useRef } from "react";
import { useFocusStore } from "../../store/library";
import { throttle } from "lodash";
import { FocusId, FocusItem } from "../../types";

const FOCUS_WEIGHT_HIGH = 10;
const FOCUS_WEIGHT_LOW = 1;
const THROTTLE_SPEED = 300; // in milliseconds

type NavigationDirections = "up" | "down" | "left" | "right";

const checkForCollisions = (
  focusChildren: [string, FocusItem][],
  direction: NavigationDirections,
  currentItem: FocusItem
) => {
  // If we find a new focus item we store it here to compare against other options
  let foundKey: FocusId | undefined;
  let foundItem: FocusItem | undefined;
  // Filter items based on the direction we're searching
  // Then loop over each one and check which is actually closest
  focusChildren
    .filter(([_, focusItem]) => {
      switch (direction) {
        case "up":
          return focusItem.position.y < currentItem.position.y;
        case "down":
          return focusItem.position.y > currentItem.position.y;
        case "left":
          return focusItem.position.x < currentItem.position.x;
        case "right":
          return focusItem.position.x > currentItem.position.x;
      }
    })
    .forEach(([key, focusItem]) => {
      console.log(
        "found container child focus item",
        direction,
        key,
        currentItem.position,
        focusItem.position
      );
      // Check if it's the closest item
      // Change logic depending on the direction
      let foundComparisonVertical;
      let baseComparisonVertical;
      let foundComparisonSide;
      let baseComparisonSide;
      switch (direction) {
        case "up": {
          if (!foundItem) break;

          // This basically works with a "weight" system.
          // Inspired by Norigin's Spatial Navigation priority system.
          // We compare the "found" element to the current one
          // And the original focus element vs the current one
          // using the vertical and side measurements.
          // But since certain directions care more about certain sides
          // we give more "weight"/priority to the matching side (vertical dir = vertical side)
          // This helps navigate more in the direction we want
          foundComparisonVertical =
            Math.abs(foundItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_LOW;
          baseComparisonVertical =
            Math.abs(focusItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_LOW;

          foundComparisonSide =
            Math.abs(foundItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_HIGH;
          baseComparisonSide =
            Math.abs(focusItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_HIGH;
          break;
        }
        case "down": {
          if (!foundItem) break;

          foundComparisonVertical =
            Math.abs(foundItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_LOW;
          baseComparisonVertical =
            Math.abs(focusItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_LOW;

          foundComparisonSide =
            Math.abs(foundItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_HIGH;
          baseComparisonSide =
            Math.abs(focusItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_HIGH;
          break;
        }
        case "left": {
          if (!foundItem) break;

          foundComparisonVertical =
            Math.abs(foundItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_HIGH;
          baseComparisonVertical =
            Math.abs(focusItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_HIGH;

          foundComparisonSide =
            Math.abs(foundItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_LOW;
          baseComparisonSide =
            Math.abs(focusItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_LOW;
          break;
        }
        case "right": {
          if (!foundItem) break;

          foundComparisonVertical =
            Math.abs(foundItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_HIGH;
          baseComparisonVertical =
            Math.abs(focusItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_HIGH;

          foundComparisonSide =
            Math.abs(foundItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_LOW;
          baseComparisonSide =
            Math.abs(focusItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_LOW;
          break;
        }
        default: {
          break;
        }
      }

      if (
        foundComparisonVertical &&
        foundComparisonSide &&
        baseComparisonVertical &&
        baseComparisonSide
      ) {
        const foundComparisonTotal =
          foundComparisonVertical + foundComparisonSide;

        const baseComparisonTotal = baseComparisonVertical + baseComparisonSide;

        if (foundComparisonTotal > baseComparisonTotal) {
          foundKey = key;
          foundItem = focusItem;
        }
      }
      console.log("done checking");
      // No item to check against? This one wins then.
      if (!foundItem) {
        console.log("default item selected", key, focusItem);
        foundKey = key;
        foundItem = focusItem;
      }
    });

  return { foundKey, foundItem };
};

const Navigator = () => {
  const { input } = useFocusStore();
  const navigateUpThrottled = useRef();
  const navigateDownThrottled = useRef();
  const navigateLeftThrottled = useRef();
  const navigateRightThrottled = useRef();

  const navigate = (direction: NavigationDirections) => {
    const { focusItems, focusedItem, setFocusedItem, setFocusPosition } =
      useFocusStore.getState();

    if (typeof window == "undefined") return;
    console.log("navigating", direction);
    // Logic
    // Get current focus item
    const currentItem = focusItems[focusedItem];
    if (!currentItem) {
      // No focus item to navigate, just select something?
      // Ideally a root element with no parent
      const focusMap = Object.entries(focusItems);
      const firstFocusableItem = focusMap.find(([_, focusItem]) => {
        return focusItem.parent === "";
      });
      if (firstFocusableItem) {
        setFocusedItem(firstFocusableItem[0]);
      } else {
        const [focusKey, _] = focusMap[0];
        setFocusedItem(focusKey);
      }
    }
    // Filter the focus items by children of the parent
    const focusMap = Object.entries(focusItems);
    const focusChildren = focusMap.filter(([_, focusItem]) => {
      return focusItem.parent === currentItem.parent;
    });
    // Update positions of children
    focusChildren.forEach(([focusId, focusItem]) => {
      const focusRef = document.querySelector(`[focus-id="${focusId}"]`);
      if (!focusRef) return;

      const newPosition = focusRef.getBoundingClientRect();
      setFocusPosition(focusId, newPosition);
      focusItem.position = newPosition;
    });

    // Look for something below
    const { foundKey, foundItem } = checkForCollisions(
      focusChildren,
      direction,
      currentItem
    );

    // Did we find a nested parent? Focus the first item inside that.
    if (foundItem && foundItem.isParent) {
      console.log("Parent focused finding first child", foundItem, foundKey);
      // Focus the first child of container
      const focusChild = focusMap.find(
        ([focusId, focusItem]) => focusItem.parent == foundKey
      );
      console.log("first child found", focusChild);
      if (focusChild) {
        const [firstChildKey, firstChild] = focusChild;
        return setFocusedItem(firstChildKey);
      }
    }

    // Found something? Focus it!
    if (foundKey) {
      console.log("navigating to test", foundKey, typeof foundKey);
      return setFocusedItem(foundKey);
    }

    // Nothing? Search through remaining focus items? (helps enforce container-first logic)
    console.log("couldnt find a sibling - going outside");
    const outsideMap = focusMap.filter(([_, focusItem]) => {
      return focusItem.parent !== currentItem.parent && focusItem.focusable;
    });
    // Update positions of children
    outsideMap.forEach(([focusId, focusItem]) => {
      const focusRef = document.querySelector(`[focus-id="${focusId}"]`);
      if (!focusRef) return;

      const newPosition = focusRef.getBoundingClientRect();
      setFocusPosition(focusId, newPosition);
      focusItem.position = newPosition;
    });
    const { foundKey: foundOutsideKey } = checkForCollisions(
      outsideMap,
      direction,
      currentItem
    );

    if (foundOutsideKey) {
      console.log("navigating to", foundKey);
      return setFocusedItem(foundOutsideKey);
    }
  };

  const navigateUp = () => {
    navigate("up");
  };

  const navigateDown = () => {
    navigate("down");
  };
  const navigateLeft = () => {
    navigate("left");
  };
  const navigateRight = () => {
    navigate("right");
  };

  useEffect(() => {
    navigateUpThrottled.current = throttle(navigateUp, THROTTLE_SPEED);

    navigateDownThrottled.current = throttle(navigateDown, THROTTLE_SPEED);
    navigateLeftThrottled.current = throttle(navigateLeft, THROTTLE_SPEED);
    navigateRightThrottled.current = throttle(navigateRight, THROTTLE_SPEED);
  }, []);

  const checkInput = useCallback(() => {
    if (input.up && navigateUpThrottled.current) {
      console.log("[NAVIGATOR] navigated up");
      navigateUpThrottled.current();
    }
    if (input.down && navigateDownThrottled.current) {
      console.log("[NAVIGATOR] navigated down");
      navigateDownThrottled.current();
    }
    if (input.left && navigateLeftThrottled.current) {
      console.log("[NAVIGATOR] navigated left");
      navigateLeftThrottled.current();
    }
    if (input.right && navigateRightThrottled.current) {
      console.log("[NAVIGATOR] navigated right");
      navigateRightThrottled.current();
    }
  }, [
    input,
    navigateUpThrottled,
    navigateDownThrottled,
    navigateLeftThrottled,
    navigateRightThrottled,
  ]);

  // Check for input and navigate
  useEffect(() => {
    checkInput();
  }, [input, checkInput]);

  useEffect(() => {
    const interval = setInterval(checkInput, 100);

    return () => {
      clearInterval(interval);
    };
  }, [checkInput]);

  return <></>;
};

export default Navigator;
