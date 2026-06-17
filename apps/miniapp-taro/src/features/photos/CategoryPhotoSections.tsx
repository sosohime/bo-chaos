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
      {groups.map((group) => (
        <View key={group.categoryName} className="category-section">
          <View
            className={`category-header ${
              activeCategory === group.categoryName ? "active" : ""
            }`}
            onClick={() => onCategoryClick(group.categoryName)}
          >
            <View className="category-title">
              <Text className="category-name">{group.categoryName}</Text>
              <Text className="photo-count">({group.photos.length})</Text>
            </View>
            <Text className="arrow">
              {activeCategory === group.categoryName ? "▼" : "▶"}
            </Text>
          </View>

          {activeCategory === group.categoryName && (
            <View className="photo-grid">
              {group.photos.map((photo) => (
                <View key={photo.id} className="photo-item-wrapper">
                  <PhotoItem
                    photoData={photo}
                    onPreview={(url) => previewPhotos(url, group.photos)}
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
      ))}
      <View className="list-footer">
        <Text>
          {loading
            ? "继续加载中..."
            : activeCategory
              ? hasMore
                ? "上拉加载更多"
                : "到底啦"
              : "展开分组查看图片"}
        </Text>
      </View>
    </>
  );
}
