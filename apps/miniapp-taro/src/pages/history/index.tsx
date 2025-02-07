import { View, Button, Image } from "@tarojs/components";
import { useState } from "react";
import Taro from "@tarojs/taro";
import "./index.scss";

import type CustomTabBar from "../../custom-tab-bar";

export default function ImageUpload() {
  const pageCtx = Taro.getCurrentInstance().page;

  Taro.useDidShow(() => {
    const tabbar = Taro.getTabBar<CustomTabBar>(pageCtx);
    tabbar?.setSelected(1);
  });

  return <View className="history-container"></View>;
}
