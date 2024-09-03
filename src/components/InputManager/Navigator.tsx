import { useCallback, useEffect, useRef } from "react";
import { useFocusStore } from "../../store/library";
import { throttle } from "lodash";
import { FocusId, FocusItem } from "../../types";

const FOCUS_WEIGHT_HIGH = 5;
const FOCUS_WEIGHT_LOW = 1;
const THROTTLE_SPEED = 100; // in milliseconds

type NavigationDirections = "up" | "down" | "left" | "right";

const updateFocusPosition =
  (setFocusPosition) =>
  ([focusId, focusItem]) => {
    const focusRef = document.querySelector(`[focus-id="${focusId}"]`);
    if (!focusRef) return;

    const newPosition = focusRef.getBoundingClientRect();
    setFocusPosition(focusId, newPosition);
    focusItem.position = newPosition;
  };

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

const rememberFocusSync = (
  focusItems: Record<FocusId, FocusItem>,
  rememberFocusFlag: boolean,
  lastFocusedItemKey: FocusId,
  updateLastFocusItem: (parentId: FocusId, focusId: FocusId) => void
) => {
  if (rememberFocusFlag) {
    // We need the parent ID, so we grab the focus item for it
    const lastFocusedItem = focusItems[lastFocusedItemKey];
    if (lastFocusedItem)
      updateLastFocusItem(lastFocusedItem.parent, lastFocusedItemKey);
  }
};

const checkFocusItemsForCollisions = (
  focusMap: [string, FocusItem][],
  direction: NavigationDirections,
  currentItem: FocusItem,
  fullMap: [string, FocusItem][],
  lastFocusedItems: Record<FocusId, FocusId>,
  setFocusPosition,
  setFocusedItem
) => {
  // Update positions of children
  focusMap.forEach(updateFocusPosition(setFocusPosition));

  const { foundKey, foundItem } = checkForCollisions(
    focusMap,
    direction,
    currentItem
  );

  if (foundKey != null) {
    // Is it a parent? Focus elements inside (either first one or last saved)
    if (foundItem.isParent) {
      // Do we use the last saved item?
      if (foundItem.rememberFocus) {
        const lastFocusedItemKey = lastFocusedItems[foundKey];
        console.log(
          "REMEMBER FOCUS! checking for last item",
          lastFocusedItemKey
        );
        if (lastFocusedItemKey) {
          setFocusedItem(lastFocusedItemKey);
          return lastFocusedItemKey;
        }
      }

      // Otherwise grab first child we detect
      console.log("Checking parent for children...");
      const firstChild = getFirstChildInParent(foundKey, fullMap);
      console.log("child found maybe", firstChild);
      if (firstChild !== null) {
        setFocusedItem(firstChild);
        return firstChild;
      }
      console.log("no child found - focusing parent");
    }

    // If all else fails just focus the parent - let the user handle the focus
    setFocusedItem(foundKey);
    return foundKey;
  }
};

type NavFunc = (direction: NavigationDirections) => void;

const Navigator = () => {
  const { input } = useFocusStore();
  const navigateThrottled = useRef<NavFunc>();

  const navigate = async (direction: NavigationDirections) => {
    const {
      focusItems,
      focusedItem,
      setFocusedItem,
      setFocusPosition,
      lastFocusedItems,
      updateLastFocusItem,
    } = useFocusStore.getState();

    if (typeof window == "undefined") return;
    console.log("navigating", direction);

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

    // Does parent container need to remember focus?
    let rememberFocusFlag = false;
    const parentContainer = focusItems[currentItem.parent];
    if (parentContainer && parentContainer.rememberFocus)
      rememberFocusFlag = true;

    // Now we do 3 layers of checks (stopping early if we detect focus)
    // 1️⃣ First we check inside the current focus container
    console.log("Checking parent's children for focus item...");
    const focusMap = Object.entries(focusItems);
    const focusChildren = focusMap.filter(([_, focusItem]) => {
      return focusItem.parent === currentItem.parent;
    });

    let newFocusKey;
    // This method runs each layer.
    // It refreshes focus positions, then checks for collisions, and sets focus if found
    newFocusKey = checkFocusItemsForCollisions(
      focusChildren,
      direction,
      currentItem,
      focusMap,
      lastFocusedItems,
      setFocusPosition,
      setFocusedItem
    );
    // If we succeeded, we get a focus key back. If not, it returns `null` -- meaning keep going!
    if (newFocusKey) {
      rememberFocusSync(
        focusItems,
        rememberFocusFlag,
        newFocusKey,
        updateLastFocusItem
      );

      return;
    }

    // 2️⃣ Nothing? Search for focus items outside the current focus item's parent - container's first
    console.log("couldnt find a sibling - going outside");
    const outsideParentMap = focusMap.filter(([_, focusItem]) => {
      return (
        focusItem.parent !== currentItem.parent &&
        focusItem.focusable &&
        focusItem.isParent
      );
    });
    newFocusKey = checkFocusItemsForCollisions(
      outsideParentMap,
      direction,
      currentItem,
      focusMap,
      lastFocusedItems,
      setFocusPosition,
      setFocusedItem
    );
    if (newFocusKey) {
      rememberFocusSync(
        focusItems,
        rememberFocusFlag,
        newFocusKey,
        updateLastFocusItem
      );

      return;
    }

    // 3️⃣ Nothing? Search through the last of the focus items (non-containers)
    console.log("couldnt find a sibling - going outside");
    const outsideChildMap = focusMap.filter(([_, focusItem]) => {
      return (
        focusItem.parent !== currentItem.parent &&
        focusItem.focusable &&
        !focusItem.isParent
      );
    });
    newFocusKey = checkFocusItemsForCollisions(
      outsideChildMap,
      direction,
      currentItem,
      focusMap,
      lastFocusedItems,
      setFocusPosition,
      setFocusedItem
    );
    if (newFocusKey) {
      rememberFocusSync(
        focusItems,
        rememberFocusFlag,
        newFocusKey,
        updateLastFocusItem
      );

      return;
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
