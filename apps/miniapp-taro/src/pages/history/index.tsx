import { View, Text, ScrollView } from "@tarojs/components";
import { groupBy } from "es-toolkit";
import { useEffect, useState, useContext } from "react";
import Taro from "@tarojs/taro";
import BoSheng from "@/components/boSheng";
import { AppContext } from "@/lib/context";
import { useShare } from "@/lib/share";
import PhotoItem from "../../components/photoItem";
import { getPhotoBySystem } from "../../api/photo";

import "./index.scss";

export interface PhotoDataType {
  id: number;
  filename: string;
  name: string;
  description: string;
  viewedTimes: number;
  categoryId: number;
  status: string;
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
  updatedAt: Date;
}

export interface Vote {
  id: number;
  photoId: number;
  userOpenId: string;
  updatedAt: Date;
}

export default function History() {
  const { systemConfig } = useContext(AppContext);

  const [photoData, setPhotoData] = useState<
    {
      secondCategory: string;
      photos: PhotoDataType[];
    }[]
  >([]);
  const [activeCategory, setActiveCategory] = useState<string>("");

  useShare({
    title: "来博Fans，一起磕！",
    path: "/pages/history/index",
    imageUrl: "https://yuanbo.online/bofans_static/images/miniapplogo.png",
  });

  useEffect(() => {
    if (systemConfig?.inReview) {
      Taro.setNavigationBarTitle({
        title: systemConfig.inReview ? "历史类图片" : "博史",
      });
    }
  }, [systemConfig]);

  const fetchData = async () => {
    try {
      const res = await getPhotoBySystem("history");
      const data = res.data as unknown as PhotoDataType[];
      const group = groupBy(data, (item) => item.category.name);
      const groupedData = Object.entries(group).map(([k, v]) => ({
        secondCategory: k,
        photos: v,
      }));
      setPhotoData(groupedData);
      // 如果有数据且没有选中的分类，则默认展开第一个
      if (groupedData.length > 0 && !activeCategory) {
        setActiveCategory(groupedData[0].secondCategory);
      }
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
    <ScrollView
      scrollY
      className="history-container"
      refresherEnabled
      enableBackToTop
      refresherTriggered={refreshing}
      onRefresherRefresh={onRefresh}
    >
      <BoSheng boxStyle={{ padding: "20px 20px 4px" }} />
      {photoData.length > 0 ? (
        photoData.map((category) => (
          <View key={category.secondCategory} className="category-section">
            <View
              className={`category-header ${
                activeCategory === category.secondCategory ? "active" : ""
              }`}
              onClick={() => handleCategoryClick(category.secondCategory)}
            >
              <View className="category-title">
                <Text className="category-name">{category.secondCategory}</Text>
                <Text className="photo-count">({category.photos.length})</Text>
              </View>
              <Text className="arrow">
                {activeCategory === category.secondCategory ? "▼" : "▶"}
              </Text>
            </View>

            {activeCategory === category.secondCategory && (
              <View className="photo-grid">
                {category.photos.map((photo) => (
                  <View key={photo.id} className="photo-item-wrapper">
                    <PhotoItem
                      photoData={photo}
                      onPreview={(url) =>
                        handlePreview(
                          url,
                          category.photos.map((p) => p.filename),
                        )
                      }
                      size={{
                        height: "200px",
                        width: "100%",
                      }}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        ))
      ) : (
        <View className="empty-state">
          <Text>暂无数据</Text>
        </View>
      )}
    </ScrollView>
  );
}
