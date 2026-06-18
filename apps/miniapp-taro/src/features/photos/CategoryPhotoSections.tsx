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
        <Text className="state-kicker">分组加载</Text>
        <Text className="state-title">图片加载中</Text>
        <Text className="state-copy">正在获取当前图库分组</Text>
      </View>
    );
  }

  if (groups.length === 0 && error) {
    return (
      <View className="list-state" onClick={onRetry}>
        <Text className="state-kicker">加载异常</Text>
        <Text className="state-title">加载失败</Text>
        <Text className="state-action">点击重试</Text>
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View className="list-state">
        <Text className="state-kicker">图库分组</Text>
        <Text className="state-title">暂无数据</Text>
        <Text className="state-copy">当前板块还没有可展示图片</Text>
      </View>
    );
  }

  return (
    <>
      <View className="photo-browser-shell">
        <View className="photo-browser-toolbar">
          <View className="photo-browser-title-block">
            <Text className="photo-browser-label">图库分组</Text>
            <Text className="photo-browser-active">
              {activeCategory || "选择一个分组"}
            </Text>
          </View>
          <Text className="photo-browser-sync">
            {loading ? "加载中" : hasMore ? "可继续加载" : "已加载完"}
          </Text>
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
                <Text>当前分组</Text>
                <Text>{loading ? "加载中" : "图片列表"}</Text>
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
