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
        currentItem.position.y,
        focusItem.position.y
      );
      // Check if it's the closest item
      // Change logic depending on the direction
      switch (direction) {
        case "up": {
          if (foundItem && foundItem.position.y < focusItem.position.y) {
            foundKey = key;
            foundItem = focusItem;
          }
          break;
        }
        case "down": {
          if (foundItem && foundItem.position.y > focusItem.position.y) {
            foundKey = key;
            foundItem = focusItem;
          }
          break;
        }
        case "left": {
          if (foundItem && foundItem.position.x < focusItem.position.x) {
            foundKey = key;
            foundItem = focusItem;
          }
          break;
        }
        case "right": {
          if (foundItem && foundItem.position.x > focusItem.position.x) {
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

  // Check for input and navigate
  useEffect(() => {
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

  return <></>;
};

export default Navigator;
