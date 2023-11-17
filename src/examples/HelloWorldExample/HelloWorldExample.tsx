import FocusContainer from "../../components/FocusContainer/FocusContainer";
import ExampleFocusComponent from "./ExampleFocusComponent";
import InputManager from "../../components/InputManager/InputManager";
import InputMirror from "./InputMirror";
import { useFocusStore } from "../../store/library";
import DebugView from "../../components/DebugView/DebugView";
import ExampleAnimatedComponent from "./ExampleAnimatedComponent";

const HelloWorldExample = () => {
  const { focusItems } = useFocusStore();
  console.log("focusItems", focusItems);
  return (
    <div>
      <InputManager />
      <div style={{ display: "flex" }}>
        <div>
          <h1>Focus Container #1:</h1>
          <FocusContainer
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <ExampleFocusComponent initialFocus />
            <ExampleFocusComponent />
            <ExampleFocusComponent />
            <ExampleFocusComponent />
          </FocusContainer>
          <h1>Focus Container #2:</h1>
          <FocusContainer
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <ExampleFocusComponent />
            <ExampleFocusComponent />
            <ExampleFocusComponent />
            <ExampleFocusComponent />
          </FocusContainer>
        </div>
        <div>
          <h1>Focus Container #3:</h1>
          <FocusContainer
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <ExampleFocusComponent />
            <ExampleFocusComponent />
            <ExampleFocusComponent />
            <ExampleFocusComponent />
          </FocusContainer>
          <h1>Focus Container #4:</h1>
          <FocusContainer
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <ExampleFocusComponent />
            <ExampleFocusComponent />
            <ExampleFocusComponent id="hover" />
            <ExampleAnimatedComponent />
          </FocusContainer>
        </div>
      </div>
      <style>
        {`div:focus {
          border:1px solid teal;
        }
        #hover { 
          transform: translateY(20px);
        }
        #hover:hover { 
          background:red;
          transform: translateX(20px) translateY(20px);
        }

        @keyframes move-horizontal {
          from { transform: translateX(0px) }
          to { transform: translateX(20px) }
        }
        #animated {
          animation-name: move-horizontal;
          animation-duration: 4s;
          animation-direction: alternate;
          animation-iteration-count: infinite;
        }
        `}
      </style>

      <InputMirror />
      <DebugView />
    </div>
  );
};

export default HelloWorldExample;
