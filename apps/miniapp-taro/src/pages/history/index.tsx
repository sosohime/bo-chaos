import { View, Button, Image, Text } from "@tarojs/components";
import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { getPhotoBySystem } from "../../api/photo";
import "./index.scss";

import type CustomTabBar from "../../custom-tab-bar";

export default function ImageUpload() {
  const pageCtx = Taro.getCurrentInstance().page;
  const [photoData, setPhotoData] = useState<
    {
      secondCategory: string;
      photos: PhotoResType;
    }[]
  >([]);

  Taro.useDidShow(() => {
    const tabbar = Taro.getTabBar<CustomTabBar>(pageCtx);
    tabbar?.setSelected(1);
  });

  useEffect(() => {
    getPhotoBySystem("history").then((res) => {
      console.log("history", res);
    });
  }, []);

  return (
    <View className="history-container">
      <Text>史</Text>
    </View>
  );
}
