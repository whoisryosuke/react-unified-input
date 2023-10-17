import { createContext, useContext } from "react";

// This keeps the focusId of the `FocusContainer`
export const FocusContext = createContext<number>(0);

export const useFocusContext = () => useContext(FocusContext);
