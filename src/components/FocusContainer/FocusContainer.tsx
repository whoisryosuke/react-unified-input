import React, { PropsWithChildren } from "react";
import { FocusContext } from "../../context/FocusContext";
import useFocusable from "../../hooks/useFocusable";

type Props = {};

const FocusContainer = ({ children, ...props }: PropsWithChildren<Props>) => {
  const { ref, focusId } = useFocusable({ focusable: false });

  return (
    <FocusContext.Provider value={focusId}>
      <div ref={ref} {...props}>
        {children}
      </div>
    </FocusContext.Provider>
  );
};

export default FocusContainer;
