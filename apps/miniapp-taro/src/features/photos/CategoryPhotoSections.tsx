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
  if (groups.length === 0 && loading) {
    return (
      <View className="list-state">
        <Text>图片加载中...</Text>
      </View>
    );
  }

  if (groups.length === 0 && error) {
    return (
      <View className="list-state" onClick={onRetry}>
        <Text>加载失败</Text>
        <Text className="state-action">点我重试</Text>
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View className="list-state">
        <Text>暂无数据</Text>
      </View>
    );
  }

  return (
    <>
      <View className="photo-browser-shell">
        <View className="photo-browser-toolbar">
          <View>
            <Text className="photo-browser-label">资源分组</Text>
            <Text className="photo-browser-active">
              {activeCategory || "选择一个分组"}
            </Text>
          </View>
          <Text className="photo-browser-sync">
            {loading ? "同步中" : hasMore ? "可继续加载" : "已同步"}
          </Text>
        </View>
      </View>
      {groups.map((group) => (
        <View key={group.categoryName} className="category-section">
          <View
            className={`category-header ${
              activeCategory === group.categoryName ? "active" : ""
            }`}
            onClick={() => onCategoryClick(group.categoryName)}
          >
            <View className="category-title">
              <Text className="category-index">资源集</Text>
              <Text className="category-name">{group.categoryName}</Text>
            </View>
            <View className="category-state">
              <Text>
                {activeCategory === group.categoryName ? "已展开" : "查看"}
              </Text>
              <Text className="arrow">
                {activeCategory === group.categoryName ? "−" : "+"}
              </Text>
            </View>
          </View>

          {activeCategory === group.categoryName && (
            <View className="category-body">
              <View className="category-body-head">
                <Text>当前分组</Text>
                <Text>{loading ? "加载中" : "图片资源"}</Text>
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
        <Text>
          {loading
            ? "继续加载..."
            : activeCategory
              ? hasMore
                ? "上拉加载更多"
                : "已加载全部"
              : "展开分组查看图片"}
        </Text>
      </View>
    </>
  );
}
