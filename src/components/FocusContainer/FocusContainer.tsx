import { PropsWithChildren, useEffect } from "react";
import { FocusContext } from "../../context/FocusContext";
import useFocusable from "../../hooks/useFocusable";
import { useFocusStore } from "../../store/library";

const BASE_STYLES: React.CSSProperties = {
  position: "relative",
};

type Props = {
  style: React.CSSProperties;
  debug?: boolean;
};

const FocusContainer = ({
  children,
  debug = false,
  style,
  ...props
}: PropsWithChildren<Props>) => {
  const { ref, focusId } = useFocusable<HTMLDivElement>({ isParent: true });
  const styles = {
    ...BASE_STYLES,
    ...style,
  };

  return (
    <FocusContext.Provider value={focusId}>
      <div ref={ref} style={styles} {...props}>
        {children}
        {debug && (
          <small
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              padding: "4px",
              zIndex: -1,
              background: "lightgray",
            }}
          >
            {focusId.split("-")[1]}
          </small>
        )}
      </div>
    </FocusContext.Provider>
  );
};

export default FocusContainer;
