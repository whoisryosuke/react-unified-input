import FocusContainer from "../../components/FocusContainer/FocusContainer";
import ExampleFocusComponent from "./ExampleFocusComponent";
import InputManager from "../../components/InputManager/InputManager";
import InputMirror from "./InputMirror";
import { useFocusStore } from "../../store/library";
import DebugView from "../../components/DebugView/DebugView";
import ExampleAnimatedComponent from "./ExampleAnimatedComponent";
import KeyGuide from "../KeyGuide/KeyGuide";

const HelloWorldExample = () => {
  const { focusItems, currentDevice, deviceName } = useFocusStore();
  // console.log("focusItems", focusItems);
  return (
    <div>
      <InputManager />
      <div>
        <h2>Current Device: {currentDevice}</h2>
        <h3>Device Name: {deviceName}</h3>
        <h3 style={{ margin: 0 }}>Key guide</h3>
        <div style={{ display: "flex" }}>
          <KeyGuide input="up" />
          <KeyGuide input="left" />
          <KeyGuide input="right" />
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <div>
          <h1>Focus Container #1:</h1>
          <FocusContainer
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "1em",
              margin: "1em",
            }}
            debug
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
              padding: "1em",
              margin: "1em",
            }}
            debug
            rememberFocus
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
              padding: "1em",
              margin: "1em",
            }}
            debug
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
              padding: "1em",
              margin: "1em",
            }}
            debug
          >
            <ExampleFocusComponent />
            <ExampleFocusComponent />
            <ExampleFocusComponent id="hover" />
            <ExampleAnimatedComponent />
          </FocusContainer>
        </div>
        <div>
          <FocusContainer
            style={{
              width: "70%",
              position: "absolute",
              bottom: 100,
              right: 16,
              display: "flex",
              flexDirection: "column",
              padding: "1em",
              margin: "1em",
            }}
            debug
          >
            <ExampleFocusComponent
              style={{
                width: "100%",
              }}
            />
            <FocusContainer
              style={{
                width: "100%",

                marginTop: 16,
                gap: "1em",
              }}
            >
              <ExampleFocusComponent style={{ marginRight: "1em" }} />
              <ExampleFocusComponent style={{ marginRight: "1em" }} />
              <ExampleFocusComponent />
            </FocusContainer>
          </FocusContainer>
        </div>
      </div>
      <style>
        {`div:focus {
          border:1px solid teal;
        }
        #hover { 
          transform: translateY(40px);
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
