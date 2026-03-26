import { createContext, useContext, useState } from "react";

type LoadingContextType = {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw Error("Loading used outside provider");
  return ctx;
};

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
