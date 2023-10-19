import { createContext, useContext } from "react";

// This keeps the focusId of the `FocusContainer`
export const FocusContext = createContext<string>("");

export const useFocusContext = () => useContext(FocusContext);
