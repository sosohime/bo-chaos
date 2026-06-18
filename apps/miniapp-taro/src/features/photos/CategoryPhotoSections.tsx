import { View, Text } from "@tarojs/components";
import PhotoItem from "@/components/photoItem";
import PhotoListState from "./PhotoListState";
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
      <PhotoListState
        tone="loading"
        kicker="图库状态"
        title="正在加载图片"
        copy="正在获取当前资源分组"
      />
    );
  }

  if (groups.length === 0 && error) {
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

  if (groups.length === 0) {
    return (
      <PhotoListState
        tone="empty"
        kicker="图库分组"
        title="没有图片"
        copy="当前板块还没有可展示图片"
      />
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
      {groups.map((group) => {
        const isActive = activeCategory === group.categoryName;
        const loadedCount = group.photos.length;

        return (
          <View
            key={group.categoryName}
            className={`category-section ${isActive ? "active" : ""}`}
          >
            <View
              className={`category-header ${isActive ? "active" : ""}`}
              onClick={() => onCategoryClick(group.categoryName)}
            >
              <View className="category-title">
                <Text className="category-index">资源分组</Text>
                <Text className="category-name">{group.categoryName}</Text>
                <Text className="category-count">
                  当前载入 {loadedCount} 项
                </Text>
              </View>
              <View className="category-state">
                <Text>{isActive ? "收起" : "展开"}</Text>
                <Text className="arrow"></Text>
              </View>
            </View>

            {isActive && (
              <View className="category-body">
                <View className="category-body-head">
                  <Text>当前分组</Text>
                  <Text>{loadedCount} 项</Text>
                </View>
                <View className="photo-grid">
                  {group.photos.map((photo) => (
                    <PhotoItem
                      key={photo.id}
                      photoData={photo}
                      onPreview={(url) => previewPhotos(url, group.photos)}
                      size={{
                        height: "216px",
                        width: "100%",
                      }}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        );
      })}
      <View className="list-footer">
        <Text className="list-footer-label">{footerStatus}</Text>
      </View>
    </>
  );
}
