import React from "react";
import FocusContainer from "../../components/FocusContainer/FocusContainer";
import ExampleFocusComponent from "./ExampleFocusComponent";
import InputManager from "../../components/InputManager/InputManager";

type Props = {};

const HelloWorldExample = (props: Props) => {
  return (
    <div>
      <InputManager />
      <FocusContainer>
        <ExampleFocusComponent initialFocus />
        <ExampleFocusComponent />
        <ExampleFocusComponent />
        <ExampleFocusComponent />
      </FocusContainer>
    </div>
  );
};

export default HelloWorldExample;
