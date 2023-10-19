import React, { useEffect } from "react";
import { useLibraryStore } from "../../store/library";
import { throttle } from "lodash";

type Props = {};

const Navigator = (props: Props) => {
  const { focusItems, input } = useLibraryStore();

  const navigateUp = () => {
    // Logic
  };
  const navigateUpThrottled = throttle(navigateUp, 300);

  // Check for input and navigate
  useEffect(() => {
    if (input.up) {
      navigateUpThrottled();
    }
  }, [input, navigateUpThrottled]);

  return <></>;
};

export default Navigator;
