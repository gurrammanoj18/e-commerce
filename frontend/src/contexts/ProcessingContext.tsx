import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

interface ProcessingState {
  title: string;
  message: string;
}

interface ProcessingContextValue {
  active: boolean;
  startProcessing: (state?: Partial<ProcessingState>) => number;
  stopProcessing: (id: number) => void;
}

const DEFAULT_PROCESSING_STATE: ProcessingState = {
  title: "Please wait",
  message: "We are processing your request...",
};

const ProcessingContext = createContext<ProcessingContextValue | undefined>(undefined);

export const ProcessingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const nextIdRef = useRef(1);
  const [activeEntries, setActiveEntries] = useState<Array<{ id: number; state: ProcessingState }>>(
    [],
  );

  const startProcessing = useCallback((state?: Partial<ProcessingState>) => {
    const id = nextIdRef.current++;
    setActiveEntries((current) => [
      ...current,
      {
        id,
        state: {
          title: state?.title || DEFAULT_PROCESSING_STATE.title,
          message: state?.message || DEFAULT_PROCESSING_STATE.message,
        },
      },
    ]);
    return id;
  }, []);

  const stopProcessing = useCallback((id: number) => {
    setActiveEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const currentEntry = activeEntries[activeEntries.length - 1]?.state ?? null;

  const value = useMemo(
    () => ({
      active: Boolean(currentEntry),
      startProcessing,
      stopProcessing,
    }),
    [currentEntry, startProcessing, stopProcessing],
  );

  return (
    <ProcessingContext.Provider value={value}>
      {children}
    </ProcessingContext.Provider>
  );
};

export const useProcessing = () => {
  const context = useContext(ProcessingContext);
  if (!context) {
    throw new Error("useProcessing must be used within ProcessingProvider");
  }
  return context;
};
