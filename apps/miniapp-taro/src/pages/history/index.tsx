import { ScrollView, View } from "@tarojs/components";
import { useContext, useEffect } from "react";
import Taro from "@tarojs/taro";
import BoSheng from "@/components/boSheng";
import CategoryPhotoSections from "@/features/photos/CategoryPhotoSections";
import UgcDisabledState from "@/features/photos/UgcDisabledState";
import { useSystemPhotoGroups } from "@/features/photos/use-system-photo-groups";
import { AppContext } from "@/lib/context";
import { getMiniappConfig, isUgcEnabled } from "@/lib/runtime-config";
import { useShare } from "@/lib/share";

import "./index.scss";

export default function History() {
  const { systemConfig } = useContext(AppContext);
  const ugcEnabled = isUgcEnabled(systemConfig);
  const miniapp = getMiniappConfig(systemConfig);
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
  } = useSystemPhotoGroups("history", ugcEnabled);

  useShare({
    title: "来博Fans，一起磕！",
    path: "/pages/history/index",
    imageUrl: "https://yuanbo.online/bofans_static/images/miniapplogo.png",
  });

  useEffect(() => {
    Taro.setNavigationBarTitle({
      title: systemConfig?.inReview
        ? miniapp.pages.photoTitles.history
        : "博史",
    });
  }, [systemConfig]);

  return (
    <ScrollView
      scrollY
      className="history-container photo-page"
      refresherEnabled
      enableBackToTop
      refresherTriggered={refreshing}
      onRefresherRefresh={refresh}
      onScrollToLower={loadMore}
    >
      <View className="photo-page-content">
        <BoSheng boxStyle={{ padding: "20px 20px 4px" }} />
        {ugcEnabled ? (
          <CategoryPhotoSections
            groups={groups}
            activeCategory={activeCategory}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onCategoryClick={toggleCategory}
            onRetry={refresh}
          />
        ) : (
          <UgcDisabledState systemConfig={systemConfig} />
        )}
      </View>
    </ScrollView>
  );
}
