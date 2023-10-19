import React from "react";
import useFocusable from "../../hooks/useFocusable";

type Props = {};

const ExampleFocusComponent = (props: Props) => {
  const { ref } = useFocusable();

  return <div ref={ref}>Focusable Component</div>;
};

export default ExampleFocusComponent;
