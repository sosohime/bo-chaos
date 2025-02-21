import { createContext } from "react";

export const AppContext = createContext({
  selectedTab: 0,
  setSelectedTab: (index: number) => {},
});
