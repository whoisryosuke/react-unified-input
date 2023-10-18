import React from "react";
import { useLibraryStore } from "../../store/library";
import { throttle } from "lodash";

type Props = {};

const Navigator = (props: Props) => {
  const { focusItems, input } = useLibraryStore();

  const navigateUp = () => {
    // Logic
  };
  const navigateUpThrottled = throttle(navigateUp, 300);

  useEffect(() => {
    if (input.up) {
      navigateUpThrottled();
    }
  }, [input]);

  return <></>;
};

export default Navigator;
