import { useCallback, useEffect } from "react";
import { useFocusStore } from "../../store/library";
import { throttle } from "lodash";
import { FocusId, FocusItem } from "../../types";

const FOCUS_WEIGHT_HIGH = 5;
const FOCUS_WEIGHT_LOW = 1;

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
          const foundComparisonVertical =
            Math.abs(foundItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_LOW;
          const baseComparisonVertical =
            Math.abs(focusItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_LOW;

          const foundComparisonSide =
            Math.abs(foundItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_HIGH;
          const baseComparisonSide =
            Math.abs(focusItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_HIGH;

          const foundComparisonTotal =
            foundComparisonVertical + foundComparisonSide;

          const baseComparisonTotal =
            baseComparisonVertical + baseComparisonSide;

          // Is the new object closer than the old object?
          if (foundComparisonTotal > baseComparisonTotal) {
            foundKey = key;
            foundItem = focusItem;
          }
          break;
        }
        case "down": {
          if (!foundItem) break;

          const foundComparisonVertical =
            Math.abs(foundItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_LOW;
          const baseComparisonVertical =
            Math.abs(focusItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_LOW;

          const foundComparisonSide =
            Math.abs(foundItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_HIGH;
          const baseComparisonSide =
            Math.abs(focusItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_HIGH;

          const foundComparisonTotal =
            foundComparisonVertical + foundComparisonSide;

          const baseComparisonTotal =
            baseComparisonVertical + baseComparisonSide;

          if (foundComparisonTotal > baseComparisonTotal) {
            foundKey = key;
            foundItem = focusItem;
          }
          break;
        }
        case "left": {
          if (!foundItem) break;

          const foundComparisonVertical =
            Math.abs(foundItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_HIGH;
          const baseComparisonVertical =
            Math.abs(focusItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_HIGH;

          const foundComparisonSide =
            Math.abs(foundItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_LOW;
          const baseComparisonSide =
            Math.abs(focusItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_LOW;

          const foundComparisonTotal =
            foundComparisonVertical + foundComparisonSide;

          const baseComparisonTotal =
            baseComparisonVertical + baseComparisonSide;

          if (foundComparisonTotal > baseComparisonTotal) {
            foundKey = key;
            foundItem = focusItem;
          }
          break;
        }
        case "right": {
          if (!foundItem) break;

          const foundComparisonVertical =
            Math.abs(foundItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_HIGH;
          const baseComparisonVertical =
            Math.abs(focusItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_HIGH;

          const foundComparisonSide =
            Math.abs(foundItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_LOW;
          const baseComparisonSide =
            Math.abs(focusItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_LOW;

          const foundComparisonTotal =
            foundComparisonVertical + foundComparisonSide;

          const baseComparisonTotal =
            baseComparisonVertical + baseComparisonSide;

          if (foundComparisonTotal > baseComparisonTotal) {
            foundKey = key;
            foundItem = focusItem;
          }
          break;
        }
        default: {
          break;
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

  return foundKey;
};

const Navigator = () => {
  const { input } = useFocusStore();

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
    const foundKey = checkForCollisions(focusChildren, direction, currentItem);

    // Found something? Focus it!
    if (foundKey) {
      console.log("navigating to", foundKey);
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
    const foundOutsideKey = checkForCollisions(
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
  const navigateUpThrottled = useCallback(
    () => throttle(navigateUp, 10000)(),
    []
  );
  const navigateDownThrottled = useCallback(
    () => throttle(navigateDown, 10000)(),
    []
  );
  const navigateLeftThrottled = useCallback(
    () => throttle(navigateLeft, 10000)(),
    []
  );
  const navigateRightThrottled = useCallback(
    () => throttle(navigateRight, 10000)(),
    []
  );

  const checkInput = useCallback(() => {
    if (input.up) {
      console.log("[NAVIGATOR] navigated up");
      navigateUpThrottled();
    }
    if (input.down) {
      console.log("[NAVIGATOR] navigated down");
      navigateDownThrottled();
    }
    if (input.left) {
      console.log("[NAVIGATOR] navigated left");
      navigateLeftThrottled();
    }
    if (input.right) {
      console.log("[NAVIGATOR] navigated right");
      navigateRightThrottled();
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
