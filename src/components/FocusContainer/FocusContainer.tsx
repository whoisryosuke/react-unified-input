import React, { PropsWithChildren } from "react";
import { FocusContext } from "../../context/FocusContext";
import useFocusable from "../../hooks/useFocusable";

type Props = {};

const FocusContainer = ({ children, ...props }: PropsWithChildren<Props>) => {
  const { focusId } = useFocusable();

  return (
    <FocusContext.Provider value={focusId} {...props}>
      {children}
    </FocusContext.Provider>
  );
};

export default FocusContainer;
