import React from "react";
import FocusContainer from "../../components/FocusContainer/FocusContainer";
import ExampleFocusComponent from "./ExampleFocusComponent";

type Props = {};

const HelloWorldExample = (props: Props) => {
  return (
    <div>
      <FocusContainer>
        <ExampleFocusComponent />
      </FocusContainer>
    </div>
  );
};

export default HelloWorldExample;
