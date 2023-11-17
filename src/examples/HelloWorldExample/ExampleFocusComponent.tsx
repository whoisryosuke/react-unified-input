import { useEffect } from "react";
import useFocusable from "../../hooks/useFocusable";
import { useFocusStore } from "../../store/library";

type Props = React.HTMLAttributes<HTMLButtonElement> & {
  initialFocus?: boolean;
};

const ExampleFocusComponent = ({ initialFocus = false, ...props }: Props) => {
  const { ref, focusId, focused } = useFocusable<HTMLButtonElement>();
  const { setFocusedItem } = useFocusStore();

  // Initially focus
  useEffect(() => {
    initialFocus && setFocusedItem(focusId);
  }, [focusId, initialFocus, setFocusedItem]);

  return (
    <button
      ref={ref}
      style={{ backgroundColor: focused ? "blue" : "transparent" }}
      onClick={() => console.log("button pressed!")}
      {...props}
    >
      Focusable Component
    </button>
  );
};

export default ExampleFocusComponent;
