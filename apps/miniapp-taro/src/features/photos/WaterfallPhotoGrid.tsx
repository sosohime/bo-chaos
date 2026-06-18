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
  const browserStatus = loading ? "同步中" : hasMore ? "有更多" : "已完成";
  const footerStatus = loading
    ? "正在加载图片"
    : hasMore
      ? "继续上滑加载"
      : "当前图库已全部显示";

  if (photos.length === 0 && loading) {
    return (
      <View className="list-state">
        <Text className="state-kicker">图库状态</Text>
        <Text className="state-title">正在加载图片</Text>
        <Text className="state-copy">正在获取当前图库内容</Text>
      </View>
    );
  }

  if (photos.length === 0 && error) {
    return (
      <View className="list-state" onClick={onRetry}>
        <Text className="state-kicker">加载异常</Text>
        <Text className="state-title">图片加载失败</Text>
        <Text className="state-action">点击重试</Text>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View className="list-state">
        <Text className="state-kicker">图库内容</Text>
        <Text className="state-title">没有图片</Text>
        <Text className="state-copy">当前列表还没有可展示图片</Text>
      </View>
    );
  }

  return (
    <>
      <View className="photo-browser-shell waterfall-shell">
        <View className="photo-browser-toolbar">
          <View className="photo-browser-title-block">
            <Text className="photo-browser-label">资源视图</Text>
            <Text className="photo-browser-active">全部图片</Text>
          </View>
          <Text className="photo-browser-sync">{browserStatus}</Text>
        </View>
      </View>
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
        <Text className="list-footer-label">{footerStatus}</Text>
      </View>
    </>
  );
}
