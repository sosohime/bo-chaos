import React, { useEffect, useState } from "react";
import Taro, { useDidShow, useDidHide, useLaunch } from "@tarojs/taro";
import { AppContext } from "./lib/context";
import { getSystemConfig } from "@/api/system";
import { BofansSystemConfigType } from "@mono/types";

// 全局样式
import "./app.scss";

function App(props) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [systemConfig, setSystemConfig] = useState<BofansSystemConfigType>({});

  // 可以使用所有的 React Hooks
  useEffect(() => {});

  useLaunch(() => {
    loadSystemConfig();
  });

  // 对应 onShow
  useDidShow(() => {});

  // 对应 onHide
  useDidHide(() => {});

  async function loadSystemConfig() {
    try {
      const res = await getSystemConfig();
      setSystemConfig(res);
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
