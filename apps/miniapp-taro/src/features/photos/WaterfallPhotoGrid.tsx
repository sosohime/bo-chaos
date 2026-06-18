import { View, Text } from "@tarojs/components";
import PhotoItem from "@/components/photoItem";
import PhotoListState from "./PhotoListState";
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
      : "当前图库已完成";

  if (photos.length === 0 && loading) {
    return (
      <PhotoListState
        tone="loading"
        kicker="图库状态"
        title="正在加载图片"
        copy="正在获取当前图库内容"
      />
    );
  }

  if (photos.length === 0 && error) {
    return (
      <PhotoListState
        tone="error"
        kicker="加载异常"
        title="图片加载失败"
        actionText="点击重试"
        onClick={onRetry}
      />
    );
  }

  if (photos.length === 0) {
    return (
      <PhotoListState
        tone="empty"
        kicker="图库内容"
        title="没有图片"
        copy="当前列表还没有可展示图片"
      />
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
        <View className="photo-browser-matrix">
          <View className="photo-browser-metric">
            <Text className="metric-label">已加载图片</Text>
            <Text className="metric-value">{photos.length}</Text>
          </View>
          <View className="photo-browser-metric">
            <Text className="metric-label">布局列数</Text>
            <Text className="metric-value">{columns.length}</Text>
          </View>
          <View className="photo-browser-metric">
            <Text className="metric-label">加载状态</Text>
            <Text className="metric-value metric-text">{browserStatus}</Text>
          </View>
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
