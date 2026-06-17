import { View, Text, ScrollView } from "@tarojs/components";
import { useEffect, useState, useRef, useContext } from "react";
import Taro from "@tarojs/taro";
import BoSheng from "@/components/boSheng";
import { useShare } from "@/lib/share";
import { AppContext } from "@/lib/context";
import { getPhotoBySystem } from "../../api/photo";
import type { PhotoDataType } from "../history";
import PhotoItem from "../../components/photoItem";

import "./index.scss";

export default function Tease() {
  const { systemConfig } = useContext(AppContext);

  const [photos, setPhotos] = useState<PhotoDataType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [columns, setColumns] = useState<PhotoDataType[][]>([[], [], []]);
  const columnsHeight = useRef<number[]>([0, 0, 0]);
  const columnWidth = Taro.getSystemInfoSync().windowWidth / 3;

  useShare({
    title: "快来博Fans，跟博哥一起欢乐！",
    path: "/pages/kowtow/index",
    imageUrl: "https://yuanbo.online/bofans_static/images/miniapplogo.png",
  });

  useEffect(() => {
    if (systemConfig?.inReview) {
      Taro.setNavigationBarTitle({
        title: systemConfig.inReview ? "搞笑类图片" : "博史",
      });
    }
  }, [systemConfig]);

  const getMinHeightColumnIndex = () => {
    return columnsHeight.current.indexOf(Math.min(...columnsHeight.current));
  };

  const loadImage = (
    url: string,
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      Taro.getImageInfo({
        src: url,
        success: (res) => {
          resolve({
            width: res.width,
            height: res.height,
          });
        },
        fail: reject,
      });
    });
  };

  const updateColumnsWithPhoto = async (photo: PhotoDataType) => {
    try {
      const imageInfo = await loadImage(photo.filename);
      const aspectRatio = imageInfo.height / imageInfo.width;
      const photoHeight = aspectRatio * columnWidth;

      const minHeightColumnIndex = getMinHeightColumnIndex();
      // 使用函数式更新确保获取最新的 columns 状态
      setColumns((prevColumns) => {
        const newColumns = [...prevColumns];
        const photoWithHeight = {
          ...photo,
          calculatedHeight: photoHeight,
        };

        newColumns[minHeightColumnIndex].push(photoWithHeight);
        return newColumns;
      });

      columnsHeight.current[minHeightColumnIndex] += photoHeight;
    } catch (error) {
      console.error("Failed to load image:", error);
    }
  };

  const fetchData = async () => {
    try {
      // 在开始加载前清理数据
      setPhotos([]);
      setColumns([[], [], []]);
      columnsHeight.current = [0, 0, 0];

      const res = await getPhotoBySystem("tease");
      const data = res.data as unknown as PhotoDataType[];
      setPhotos(data);

      // 逐个加载和处理图片
      for (const photo of data) {
        await updateColumnsWithPhoto(photo);
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

  const handlePreview = (url: string) => {
    Taro.previewImage({
      current: url,
      urls: photos.map((p) => p.filename),
    });
  };

  return (
    <ScrollView
      scrollY
      className="tease-container"
      refresherEnabled
      enableBackToTop
      refresherTriggered={refreshing}
      onRefresherRefresh={onRefresh}
    >
      <BoSheng boxStyle={{ padding: "10px 0 10px" }} />
      {photos.length === 0 ? (
        <View className="empty-state">
          <Text>暂无数据</Text>
        </View>
      ) : (
        <View className="waterfall">
          {columns.map((column, columnIndex) => (
            <View key={columnIndex} className="column">
              {column.map(
                (photo: PhotoDataType & { calculatedHeight?: number }) => (
                  <PhotoItem
                    key={photo.id}
                    photoData={photo}
                    onPreview={(url) => {
                      Taro.previewImage({
                        current: photo.filename,
                        urls: photos.map((p) => p.filename),
                      });
                    }}
                    size={{
                      width: "100%",
                      height: `${photo.calculatedHeight}px`,
                    }}
                  />
                ),
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
