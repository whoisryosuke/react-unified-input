import { useEffect } from "react";
import useFocusable from "../../hooks/useFocusable";
import { useFocusStore } from "../../store/library";

type Props = React.HTMLAttributes<HTMLButtonElement>;

const ExampleFocusComponent = ({ ...props }: Props) => {
  const { ref, focusId, focused, updatePosition } =
    useFocusable<HTMLButtonElement>();

  useEffect(() => {
    const interval = setInterval(updatePosition, 420);

    return () => {
      clearInterval(interval);
    };
  }, [updatePosition]);

  return (
    <>
      <button
        id="animated"
        ref={ref}
        style={{ backgroundColor: focused ? "blue" : "transparent" }}
        onClick={() => console.log("button pressed!")}
        {...props}
      >
        Animated Focusable Component
      </button>
      <style>
        {`
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
    </>
  );
};

export default ExampleFocusComponent;
