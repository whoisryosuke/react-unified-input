export const createLogger =
  (debugLog: boolean) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...msg: any[]) => {
    if (!debugLog) return;
    console.log(...msg);
  };
