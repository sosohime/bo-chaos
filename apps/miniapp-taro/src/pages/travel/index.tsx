import { ScrollView, View } from "@tarojs/components";
import { useContext, useEffect } from "react";
import Taro from "@tarojs/taro";
import BoSheng from "@/components/boSheng";
import CategoryPhotoSections from "@/features/photos/CategoryPhotoSections";
import { useSystemPhotoGroups } from "@/features/photos/use-system-photo-groups";
import { AppContext } from "@/lib/context";
import { useShare } from "@/lib/share";

import "./index.scss";

export default function Travel() {
  const { systemConfig } = useContext(AppContext);
  const {
    groups,
    activeCategory,
    loading,
    error,
    hasMore,
    refreshing,
    refresh,
    loadMore,
    toggleCategory,
  } = useSystemPhotoGroups("travel");

  useShare({
    title: "来博Fans，看博哥环游世界！",
    path: "/pages/travel/index",
    imageUrl: "https://yuanbo.online/bofans_static/images/miniapplogo.png",
  });

  useEffect(() => {
    if (systemConfig?.inReview) {
      Taro.setNavigationBarTitle({ title: "旅行类图片" });
    }
  }, [systemConfig]);

  return (
    <ScrollView
      scrollY
      className="travel-container photo-page"
      refresherEnabled
      enableBackToTop
      refresherTriggered={refreshing}
      onRefresherRefresh={refresh}
      onScrollToLower={loadMore}
    >
      <View className="photo-page-content">
        <BoSheng boxStyle={{ padding: "20px 20px 4px" }} />
        <CategoryPhotoSections
          groups={groups}
          activeCategory={activeCategory}
          loading={loading}
          error={error}
          hasMore={hasMore}
          onCategoryClick={toggleCategory}
          onRetry={refresh}
        />
      </View>
    </ScrollView>
  );
}
