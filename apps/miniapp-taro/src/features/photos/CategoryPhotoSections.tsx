import { View, Text } from "@tarojs/components";
import PhotoItem from "@/components/photoItem";
import { previewPhotos, type PhotoGroup } from "./photo-list";
import "./photo-browser.scss";

type CategoryPhotoSectionsProps = {
  groups: PhotoGroup[];
  activeCategory: string;
  loading: boolean;
  error: boolean;
  hasMore: boolean;
  onCategoryClick: (category: string) => void;
  onRetry: () => void;
};

export default function CategoryPhotoSections({
  groups,
  activeCategory,
  loading,
  error,
  hasMore,
  onCategoryClick,
  onRetry,
}: CategoryPhotoSectionsProps) {
  const browserStatus = loading ? "同步中" : hasMore ? "有更多" : "已完成";
  const footerStatus = loading
    ? "正在加载图片"
    : activeCategory
      ? hasMore
        ? "继续上滑加载"
        : "当前分组已完成"
      : "展开一个分组查看图片";

  if (groups.length === 0 && loading) {
    return (
      <View className="list-state">
        <Text className="state-kicker">图库状态</Text>
        <Text className="state-title">正在加载图片</Text>
        <Text className="state-copy">正在获取当前资源分组</Text>
      </View>
    );
  }

  if (groups.length === 0 && error) {
    return (
      <View className="list-state" onClick={onRetry}>
        <Text className="state-kicker">加载异常</Text>
        <Text className="state-title">图片加载失败</Text>
        <Text className="state-action">点击重试</Text>
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View className="list-state">
        <Text className="state-kicker">图库分组</Text>
        <Text className="state-title">没有图片</Text>
        <Text className="state-copy">当前板块还没有可展示图片</Text>
      </View>
    );
  }

  return (
    <>
      <View className="photo-browser-shell">
        <View className="photo-browser-toolbar">
          <View className="photo-browser-title-block">
            <Text className="photo-browser-label">资源分组</Text>
            <Text className="photo-browser-active">
              {activeCategory || "选择一个分组"}
            </Text>
          </View>
          <Text className="photo-browser-sync">{browserStatus}</Text>
        </View>
      </View>
      {groups.map((group) => (
        <View
          key={group.categoryName}
          className={`category-section ${
            activeCategory === group.categoryName ? "active" : ""
          }`}
        >
          <View
            className={`category-header ${
              activeCategory === group.categoryName ? "active" : ""
            }`}
            onClick={() => onCategoryClick(group.categoryName)}
          >
            <View className="category-rail"></View>
            <View className="category-title">
              <Text className="category-index">分组</Text>
              <Text className="category-name">{group.categoryName}</Text>
            </View>
            <View className="category-state">
              <Text>
                {activeCategory === group.categoryName ? "收起" : "展开"}
              </Text>
              <Text className="arrow"></Text>
            </View>
          </View>

          {activeCategory === group.categoryName && (
            <View className="category-body">
              <View className="category-body-head">
                <Text>图片内容</Text>
                <Text>{loading ? "同步中" : "可浏览"}</Text>
              </View>
              <View className="photo-grid">
                {group.photos.map((photo) => (
                  <View key={photo.id} className="photo-item-wrapper">
                    <PhotoItem
                      photoData={photo}
                      onPreview={(url) => previewPhotos(url, group.photos)}
                      size={{
                        height: "216px",
                        width: "100%",
                      }}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      ))}
      <View className="list-footer">
        <Text className="list-footer-label">{footerStatus}</Text>
      </View>
    </>
  );
}
