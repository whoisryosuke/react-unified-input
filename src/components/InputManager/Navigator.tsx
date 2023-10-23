import React, { useCallback, useEffect, useMemo } from "react";
import { useLibraryStore } from "../../store/library";
import { throttle } from "lodash";
import { FocusId, FocusItem } from "../../types";

type NavigationDirections = "up" | "down" | "left" | "right";

const checkForCollisions = (
  focusChildren: [string, FocusItem][],
  direction: NavigationDirections,
  currentItem: FocusItem
) => {
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
          // First check if object is in direction we're going
          const isCloserOnSide =
            foundItem &&
            Math.abs(foundItem.position.y - currentItem.position.y) >
              Math.abs(focusItem.position.y - currentItem.position.y);
          // Also check other axis and make sure it's closest there too
          const isCloserVertically =
            foundItem &&
            Math.abs(foundItem.position.x - currentItem.position.x) >
              Math.abs(focusItem.position.x - currentItem.position.x);
          if (isCloserOnSide || isCloserVertically) {
            foundKey = key;
            foundItem = focusItem;
          }
          break;
        }
        case "down": {
          // First check if object is in direction we're going
          const isCloserOnSide =
            foundItem &&
            Math.abs(foundItem.position.y - currentItem.position.y) >
              Math.abs(focusItem.position.y - currentItem.position.y);
          // Also check other axis and make sure it's closest there too
          const isCloserVertically =
            foundItem &&
            Math.abs(foundItem.position.x - currentItem.position.x) >
              Math.abs(focusItem.position.x - currentItem.position.x);
          if (isCloserOnSide || isCloserVertically) {
            foundKey = key;
            foundItem = focusItem;
          }
          break;
        }
        case "left": {
          // First check if object is in direction we're going
          const isCloserOnLeftSide =
            foundItem &&
            Math.abs(foundItem.position.x - currentItem.position.x) <
              Math.abs(focusItem.position.x - currentItem.position.x);
          // Also check other axis and make sure it's closest there too
          const isCloserVertically =
            foundItem &&
            Math.abs(foundItem.position.y - currentItem.position.y) >
              Math.abs(focusItem.position.y - currentItem.position.y);

          if (isCloserOnLeftSide || isCloserVertically) {
            foundKey = key;
            foundItem = focusItem;
          }
          break;
        }
        case "right": {
          // First check if object is in direction we're going
          const isCloserOnSide =
            foundItem &&
            Math.abs(foundItem.position.x - currentItem.position.x) >
              Math.abs(focusItem.position.x - currentItem.position.x);
          // Also check other axis and make sure it's closest there too
          const isCloserVertically =
            foundItem &&
            Math.abs(foundItem.position.y - currentItem.position.y) >
              Math.abs(focusItem.position.y - currentItem.position.y);

          foundItem &&
            console.log(
              "right movement - closer side",
              isCloserOnSide,
              isCloserVertically,
              Math.abs(foundItem.position.y - currentItem.position.y),
              Math.abs(focusItem.position.y - currentItem.position.y)
            );
          if (isCloserOnSide || isCloserVertically) {
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

type Props = {};

const Navigator = (props: Props) => {
  const { input } = useLibraryStore();

  const navigate = (direction: NavigationDirections) => {
    const { focusItems, focusedItem, setFocusedItem } =
      useLibraryStore.getState();
    console.log("navigating", direction);
    // Logic
    // Get current focus item
    const currentItem = focusItems[focusedItem];
    if (!currentItem) {
      // No focus item to navigate, just select something?
      const firstFocusableItem = Object.entries(focusItems).find(
        ([_, focusItem]) => {
          return focusItem.parent === "";
        }
      );
      if (firstFocusableItem) {
        setFocusedItem(firstFocusableItem[0]);
      }
    }
    // Filter the focus items by children of the parent
    const focusMap = Object.entries(focusItems);
    const focusChildren = focusMap.filter(([_, focusItem]) => {
      return focusItem.parent === currentItem.parent;
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
      return focusItem.parent !== currentItem.parent;
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
    console.log("[NAVIGATOR] Checking for input", input.up);
    if (input.up) {
      console.log("navigated up");
      navigateUpThrottled();
    }
    if (input.down) {
      console.log("navigated down");
      navigateDownThrottled();
    }
    if (input.left) {
      console.log("navigated left");
      navigateLeftThrottled();
    }
    if (input.right) {
      console.log("navigated right");
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
