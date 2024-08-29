import { useCallback, useEffect, useRef } from "react";
import { useFocusStore } from "../../store/library";
import { throttle } from "lodash";
import { FocusId, FocusItem } from "../../types";

const FOCUS_WEIGHT_HIGH = 10;
const FOCUS_WEIGHT_LOW = 1;
const THROTTLE_SPEED = 100; // in milliseconds

type NavigationDirections = "up" | "down" | "left" | "right";

function getFirstChildInParent(
  focusId: string,
  focusItems: [string, FocusItem][]
) {
  console.log("searching for parent key children", focusId, focusItems);
  // Filter the focus items by children of this container
  const firstChild = focusItems.find(([key, focusItem]) => {
    return focusItem.parent == focusId && focusItem.focusable;
  });

  console.log("done searching...child results", firstChild);

  // No children? Bail out.
  if (!firstChild) return null;

  // Return the child key
  return firstChild[0];
}

const checkForCollisions = (
  focusChildren: [string, FocusItem][],
  direction: NavigationDirections,
  currentItem: FocusItem
) => {
  const sortedFocusCandidates = focusChildren
    // We filter out the current parent because we'll always detect it from inside
    .filter(([focusKey, _]) => {
      return focusKey !== currentItem.parent;
    })
    // Filter items based on the direction we're searching
    .filter(([_, focusItem]) => {
      switch (direction) {
        case "up":
          return focusItem.position.y < currentItem.position.y;
        case "down":
          return focusItem.position.y > currentItem.position.bottom;
        case "left":
          return focusItem.position.x < currentItem.position.x;
        case "right":
          return focusItem.position.x > currentItem.position.right;
      }
    })
    // Then loop over each one and check which is actually closest
    .map(([key, focusItem]) => {
      console.log(
        "found container child focus item",
        direction,
        key,
        currentItem.position,
        focusItem.position
      );
      // Check if it's the closest item
      // Change logic depending on the direction
      let comparisonVertical = 0;
      let comparisonSide = 0;
      switch (direction) {
        case "up": {
          // This basically works with a "weight" system.
          // Inspired by Norigin's Spatial Navigation priority system.
          // We compare the "found" element to the current one
          // And the original focus element vs the current one
          // using the vertical and side measurements.
          // But since certain directions care more about certain sides
          // we give more "weight"/priority to the matching side (vertical dir = vertical side)
          // This helps navigate more in the direction we want
          comparisonVertical =
            Math.abs(focusItem.position.y - currentItem.position.bottom) *
            FOCUS_WEIGHT_LOW;

          comparisonSide =
            Math.abs(focusItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_HIGH;
          break;
        }
        case "down": {
          comparisonVertical =
            Math.abs(focusItem.position.bottom - currentItem.position.y) *
            FOCUS_WEIGHT_LOW;

          comparisonSide =
            Math.abs(focusItem.position.x - currentItem.position.x) *
            FOCUS_WEIGHT_HIGH;
          break;
        }
        case "left": {
          comparisonVertical =
            Math.abs(focusItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_HIGH;

          comparisonSide =
            Math.abs(focusItem.position.x - currentItem.position.right) *
            FOCUS_WEIGHT_LOW;
          break;
        }
        case "right": {
          comparisonVertical =
            Math.abs(focusItem.position.y - currentItem.position.y) *
            FOCUS_WEIGHT_HIGH;

          comparisonSide =
            Math.abs(focusItem.position.right - currentItem.position.x) *
            FOCUS_WEIGHT_LOW;
          break;
        }
        default: {
          break;
        }
      }

      const baseComparisonTotal = comparisonVertical + comparisonSide;
      console.log("score", key, baseComparisonTotal);
      return {
        key,
        item: focusItem,
        score: baseComparisonTotal,
      };
    })
    // Sort by the score we gave each item. The lowest wins.
    .sort((a, b) => {
      return a.score - b.score;
    });
  console.log("done checking", sortedFocusCandidates);

  if (sortedFocusCandidates.length <= 0) {
    return {
      foundKey: null,
      foundItem: currentItem,
    };
  }

  console.log(
    "New focus item!",
    sortedFocusCandidates[0].key,
    sortedFocusCandidates[0].item
  );

  return {
    foundKey: sortedFocusCandidates[0].key,
    foundItem: sortedFocusCandidates[0].item,
  };
};

type NavFunc = (direction: NavigationDirections) => void;

const Navigator = () => {
  const { input } = useFocusStore();
  const navigateThrottled = useRef<NavFunc>();

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
    console.log("Checking parent's children for focus item...");
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
    if (foundKey && foundItem && foundItem.isParent) {
      const firstChild = getFirstChildInParent(foundKey, focusMap);
      if (firstChild !== null) return setFocusedItem(firstChild);
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
    const { foundKey: foundOutsideKey, foundItem: foundOutsideItem } =
      checkForCollisions(outsideMap, direction, currentItem);

    if (foundOutsideKey != null) {
      // Is it a parent? Let's get the first child first
      if (foundOutsideItem.isParent) {
        console.log("Checking parent for children...");
        const firstChild = getFirstChildInParent(foundOutsideKey, focusMap);
        console.log("child found maybe", firstChild);
        if (firstChild !== null) return setFocusedItem(firstChild);
        console.log("no child found - focusing parent");
      }

      console.log("navigating to", foundKey);
      return setFocusedItem(foundOutsideKey);
    }
  };

  useEffect(() => {
    navigateThrottled.current = throttle(navigate, THROTTLE_SPEED);
  }, []);

  const checkInput = useCallback(() => {
    if (input.up && navigateThrottled.current) {
      console.log("[NAVIGATOR] navigated up");
      navigateThrottled.current("up");
    }
    if (input.down && navigateThrottled.current) {
      console.log("[NAVIGATOR] navigated down");
      navigateThrottled.current("down");
    }
    if (input.left && navigateThrottled.current) {
      console.log("[NAVIGATOR] navigated left");
      navigateThrottled.current("left");
    }
    if (input.right && navigateThrottled.current) {
      console.log("[NAVIGATOR] navigated right");
      navigateThrottled.current("right");
    }
  }, [input, navigateThrottled]);

  // Check for input and navigate
  useEffect(() => {
    checkInput();
  }, [input, checkInput]);

  // useEffect(() => {
  //   const interval = setInterval(checkInput, 100);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [checkInput]);

  return <></>;
};

export default Navigator;
