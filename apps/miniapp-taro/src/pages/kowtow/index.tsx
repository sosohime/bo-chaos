import { View, Button, Image, Text } from "@tarojs/components";
import { useState } from "react";
import Taro from "@tarojs/taro";
import "./index.scss";
import God from "../../images/god.png";

import type CustomTabBar from "../../custom-tab-bar";

export default function ImageUpload() {
  const pageCtx = Taro.getCurrentInstance().page;

  Taro.useDidShow(() => {
    const tabbar = Taro.getTabBar<CustomTabBar>(pageCtx);
    tabbar?.setSelected(0);
  });

  return (
    <View className="kowtow-container">
      <Text>
        本日已磕 6 <Text className="utc">(utc+8)</Text>
      </Text>
      <Text>全球博粉累计磕头 3378 次</Text>
      <Image src={God}></Image>
      <Text className="love">博爱世人</Text>
      <Button className="submit-kowtow" type="primary">
        磕
      </Button>
    </View>
  );
}
