import { createContext } from "react";
import { BofansSystemConfigType } from "@mono/types";
import { DEFAULT_SYSTEM_CONFIG } from "./runtime-config";

export const AppContext = createContext({
  selectedTab: 0,
  setSelectedTab: (index: number) => {},
  systemConfig: DEFAULT_SYSTEM_CONFIG as BofansSystemConfigType,
});
