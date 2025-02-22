import { createContext } from "react";
import { BofansSystemConfigType } from "@mono/types";

export const AppContext = createContext({
  selectedTab: 0,
  setSelectedTab: (index: number) => {},
  systemConfig: { inReview: true } as BofansSystemConfigType,
});
