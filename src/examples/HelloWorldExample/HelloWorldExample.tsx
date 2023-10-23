import React from "react";
import FocusContainer from "../../components/FocusContainer/FocusContainer";
import ExampleFocusComponent from "./ExampleFocusComponent";
import InputManager from "../../components/InputManager/InputManager";
import InputMirror from "./InputMirror";
import { useLibraryStore } from "../../store/library";

type Props = {};

const HelloWorldExample = (props: Props) => {
  const { focusItems } = useLibraryStore();
  console.log("focusItems", focusItems);
  return (
    <div>
      <InputManager />
      <div style={{ display: "flex" }}>
        <div>
          <h1>Focus Container #1:</h1>
          <FocusContainer>
            <ExampleFocusComponent initialFocus />
            <ExampleFocusComponent />
            <ExampleFocusComponent />
            <ExampleFocusComponent />
          </FocusContainer>
          <h1>Focus Container #2:</h1>
          <FocusContainer>
            <ExampleFocusComponent />
            <ExampleFocusComponent />
            <ExampleFocusComponent />
            <ExampleFocusComponent />
          </FocusContainer>
        </div>
        <div>
          <h1>Focus Container #3:</h1>
          <FocusContainer>
            <ExampleFocusComponent />
            <ExampleFocusComponent />
            <ExampleFocusComponent />
            <ExampleFocusComponent />
          </FocusContainer>
          <h1>Focus Container #4:</h1>
          <FocusContainer>
            <ExampleFocusComponent />
            <ExampleFocusComponent />
            <ExampleFocusComponent />
            <ExampleFocusComponent />
          </FocusContainer>
        </div>
      </div>

      <InputMirror />
    </div>
  );
};

export default HelloWorldExample;
