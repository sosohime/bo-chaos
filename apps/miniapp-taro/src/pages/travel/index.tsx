import { View, Button, Image, Text } from "@tarojs/components";
import { useState } from "react";
import Taro from "@tarojs/taro";
import "./index.scss";

import type CustomTabBar from "../../custom-tab-bar";

export default function ImageUpload() {
  const pageCtx = Taro.getCurrentInstance().page;

  Taro.useDidShow(() => {
    const tabbar = Taro.getTabBar<CustomTabBar>(pageCtx);
    tabbar?.setSelected(2);
  });

  return (
    <View className="travel-container">
      <Text>今日已磕人数: 6</Text>
    </View>
  );
}
