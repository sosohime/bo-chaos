import { useState } from "react";
import Taro, { useLaunch } from "@tarojs/taro";
import { AppContext } from "./lib/context";
import type { MiniappTabKey } from "./lib/context";
import { getSystemConfig } from "@/api/system";
import { BofansSystemConfigType } from "@mono/types";
import {
  DEFAULT_SYSTEM_CONFIG,
  normalizeSystemConfig,
} from "@/lib/runtime-config";

// 全局样式
import "./app.scss";

function App(props) {
  const [selectedTab, setSelectedTab] = useState<MiniappTabKey>("retire");
  const [systemConfig, setSystemConfig] = useState<BofansSystemConfigType>(
    DEFAULT_SYSTEM_CONFIG,
  );

  useLaunch(() => {
    const cachedConfig = Taro.getStorageSync("bofansSystemConfig");
    if (cachedConfig) {
      setSystemConfig(normalizeSystemConfig(cachedConfig));
    }
    loadSystemConfig();
  });

  async function loadSystemConfig() {
    try {
      const res = await getSystemConfig();
      const nextConfig = normalizeSystemConfig(res);
      setSystemConfig(nextConfig);
      Taro.setStorageSync("bofansSystemConfig", nextConfig);
    } catch (e) {
      console.log("获取系统配置失败", e);
    }
  }

  return (
    <AppContext.Provider value={{ selectedTab, setSelectedTab, systemConfig }}>
      {props.children}
    </AppContext.Provider>
  );
}

export default App;
