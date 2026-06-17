import { createContext } from "react";
import { BofansSystemConfigType } from "@mono/types";
import { DEFAULT_SYSTEM_CONFIG } from "./runtime-config";

export type MiniappTabKey = "retire" | "kowtow" | "history" | "travel" | "my";

export const AppContext = createContext({
  selectedTab: "retire" as MiniappTabKey,
  setSelectedTab: (_key: MiniappTabKey) => {},
  systemConfig: DEFAULT_SYSTEM_CONFIG as BofansSystemConfigType,
});
