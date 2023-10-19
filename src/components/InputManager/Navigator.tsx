import React, { useEffect } from "react";
import { useLibraryStore } from "../../store/library";
import { throttle } from "lodash";
import { FocusId, FocusItem } from "../../types";

type NavigationDirections = "up" | "down" | "left" | "right";
type Props = {};

const Navigator = (props: Props) => {
  const { focusItems, focusedItem, setFocusedItem, input } = useLibraryStore();

  const navigate = (direction: NavigationDirections) => {
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
    const focusChildren = Object.entries(focusItems).filter(
      ([_, focusItem]) => {
        return focusItem.parent === currentItem.parent;
      }
    );
    // Look for something below
    let foundKey: FocusId | undefined;
    let foundItem: FocusItem | undefined;
    focusChildren.forEach(([key, focusItem]) => {
      if (focusItem.position.y > currentItem.position.y) {
        console.log(
          "found container child below focus item",
          key,
          currentItem.position.y,
          focusItem.position.y
        );

        // Check if it's the closest item
        // Change logic depending on the direction
        switch (direction) {
          case "up": {
            if (foundItem && foundItem.position.y < focusItem.position.y) {
              console.log("officially the closest item UP");
              foundKey = key;
              foundItem = focusItem;
            }
            break;
          }
          case "down": {
            if (foundItem && foundItem.position.y > focusItem.position.y) {
              console.log("officially the closest item DOWN");
              foundKey = key;
              foundItem = focusItem;
            }
            break;
          }
          default: {
            break;
          }
        }

        // No item to check against? This one wins then.
        if (!foundItem) {
          foundKey = key;
          foundItem = focusItem;
        }
      }
    });

    // Found something? Focus it!
    if (foundKey) {
      setFocusedItem(foundKey);
    }
    // Nothing? Search through remaining focus items? (helps enforce container-first logic)
  };

  const navigateUp = () => {
    navigate("up");
  };

  const navigateDown = () => {
    navigate("down");
  };
  const navigateUpThrottled = throttle(navigateUp, 300);
  const navigateDownThrottled = throttle(navigateDown, 300);

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
  }, [input, navigateUpThrottled, navigateDownThrottled]);

  return <></>;
};

export default Navigator;
