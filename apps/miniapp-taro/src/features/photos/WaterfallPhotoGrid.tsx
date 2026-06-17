import { View, Text } from "@tarojs/components";
import PhotoItem from "@/components/photoItem";
import { previewPhotos, type PhotoCard } from "./photo-list";
import "./photo-browser.scss";

type WaterfallPhotoGridProps = {
  photos: PhotoCard[];
  columns: PhotoCard[][];
  loading: boolean;
  error: boolean;
  hasMore: boolean;
  onRetry: () => void;
};

export default function WaterfallPhotoGrid({
  photos,
  columns,
  loading,
  error,
  hasMore,
  onRetry,
}: WaterfallPhotoGridProps) {
  if (photos.length === 0 && loading) {
    return (
      <View className="list-state">
        <Text className="state-kicker">资源同步</Text>
        <Text className="state-title">图片加载中</Text>
        <Text className="state-copy">正在同步当前图库资源</Text>
      </View>
    );
  }

  if (photos.length === 0 && error) {
    return (
      <View className="list-state" onClick={onRetry}>
        <Text className="state-kicker">同步异常</Text>
        <Text className="state-title">加载失败</Text>
        <Text className="state-action">点击重试</Text>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View className="list-state">
        <Text className="state-kicker">图片资源</Text>
        <Text className="state-title">暂无数据</Text>
        <Text className="state-copy">当前列表还没有可展示图片</Text>
      </View>
    );
  }

  return (
    <>
      <View className="waterfall">
        {columns.map((column, columnIndex) => (
          <View key={columnIndex} className="column">
            {column.map((photo) => (
              <PhotoItem
                key={photo.id}
                photoData={photo}
                onPreview={(url) => previewPhotos(url, photos)}
                size={{
                  width: "100%",
                  height: `${photo.calculatedHeight || 200}px`,
                }}
              />
            ))}
          </View>
        ))}
      </View>
      <View className="list-footer">
        <Text>
          {loading ? "继续加载..." : hasMore ? "上拉加载更多" : "已加载全部"}
        </Text>
      </View>
    </>
  );
}
