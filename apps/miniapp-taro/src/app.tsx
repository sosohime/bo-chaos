import React, { useEffect, useState } from "react";
import { useDidShow, useDidHide } from "@tarojs/taro";
import { AppContext } from "./lib/context";

// 全局样式
import "./app.scss";

function App(props) {
  // 可以使用所有的 React Hooks
  useEffect(() => {});

  // 对应 onShow
  useDidShow(() => {});

  // 对应 onHide
  useDidHide(() => {});

  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <AppContext.Provider value={{ selectedTab, setSelectedTab }}>
      {props.children}
    </AppContext.Provider>
  );
}

export default App;
