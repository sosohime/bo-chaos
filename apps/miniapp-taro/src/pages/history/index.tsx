import { View, Button, Image, Text, ScrollView } from "@tarojs/components";
import { groupBy } from "es-toolkit";
import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import PhotoItem from "../../components/photoItem";
import { getPhotoBySystem } from "../../api/photo";
import VoteImage from "../../images/vote.png";
import VoteActiveImage from "../../images/vote-active.png";
import DownloadImage from "../../images/download.png";

import type CustomTabBar from "../../custom-tab-bar";

import "./index.scss";

export interface PhotoDataType {
  id: number;
  filename: string;
  name: string;
  description: string;
  viewedTimes: number;
  categoryId: number;
  published: boolean;
  authorOpenId: string;
  category: Category;
  _count: Count;
  votes: Vote[];
  hasVoted: boolean;
  votesCount: number;
}

export interface Count {
  votes: number;
}

export interface Category {
  id: number;
  system: string;
  name: string;
  secondCategory: string;
  updatedAt: Date;
}

export interface Vote {
  id: number;
  photoId: number;
  userOpenId: string;
  updatedAt: Date;
}

export default function ImageUpload() {
  const pageCtx = Taro.getCurrentInstance().page;
  const [photoData, setPhotoData] = useState<
    {
      secondCategory: string;
      photos: PhotoDataType[];
    }[]
  >([]);
  const [activeCategory, setActiveCategory] = useState<string>("");

  Taro.useDidShow(() => {
    const tabbar = Taro.getTabBar<CustomTabBar>(pageCtx);
    tabbar?.setSelected(1);
  });

  const fetchData = async () => {
    try {
      const res = await getPhotoBySystem("history");
      const data = res as unknown as PhotoDataType[];
      const group = groupBy(data, (item) => item.category.secondCategory);
      setPhotoData(
        Object.entries(group).map(([k, v]) => ({
          secondCategory: k,
          photos: v,
        })),
      );
    } catch (error) {
      Taro.showToast({
        title: "加载失败",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      Taro.showNavigationBarLoading();
      await fetchData();
      Taro.hideNavigationBarLoading();
      Taro.showToast({
        title: "刷新成功",
        icon: "success",
      });
    } catch (error) {
      Taro.hideNavigationBarLoading();
      Taro.showToast({
        title: "刷新失败",
        icon: "error",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(activeCategory === category ? "" : category);
  };

  const handleVote = (photoId: number) => {
    // TODO: 实现点赞逻辑
    console.log("vote for photo:", photoId);
  };

  const handlePreview = (url: string, urls: string[]) => {
    Taro.previewImage({
      current: url,
      urls: urls,
    });
  };

  return (
    <View className="history-container">
      <ScrollView
        scrollY
        className="scroll-container"
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={onRefresh}
      >
        {photoData.map((category) => (
          <View key={category.secondCategory} className="category-section">
            <View
              className={`category-header ${activeCategory === category.secondCategory ? "active" : ""}`}
              onClick={() => handleCategoryClick(category.secondCategory)}
            >
              <Text>{category.secondCategory}</Text>
              <Text className="arrow">
                {activeCategory === category.secondCategory ? "▼" : "▶"}
              </Text>
            </View>

            {activeCategory === category.secondCategory && (
              <View className="photo-grid">
                {category.photos.map((photo) => (
                  <PhotoItem
                    key={photo.id}
                    photoData={photo}
                    onPreview={(url) =>
                      handlePreview(
                        url,
                        category.photos.map((p) => p.filename),
                      )
                    }
                    size={{
                      height: "150px",
                      width: "100%",
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
