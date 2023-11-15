import { PropsWithChildren } from "react";
import { FocusContext } from "../../context/FocusContext";
import useFocusable from "../../hooks/useFocusable";

type Props = {
  style: React.CSSProperties;
};

const FocusContainer = ({ children, ...props }: PropsWithChildren<Props>) => {
  const { ref, focusId } = useFocusable<HTMLDivElement>({ focusable: false });

  return (
    <FocusContext.Provider value={focusId}>
      <div ref={ref} {...props}>
        {children}
      </div>
    </FocusContext.Provider>
  );
};

export default FocusContainer;
