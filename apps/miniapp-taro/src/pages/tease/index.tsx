import { ScrollView, View } from "@tarojs/components";
import { useContext, useEffect } from "react";
import Taro from "@tarojs/taro";
import BoSheng from "@/components/boSheng";
import UgcDisabledState from "@/features/photos/UgcDisabledState";
import WaterfallPhotoGrid from "@/features/photos/WaterfallPhotoGrid";
import { useWaterfallPhotos } from "@/features/photos/use-waterfall-photos";
import { AppContext } from "@/lib/context";
import { getMiniappConfig, isUgcEnabled } from "@/lib/runtime-config";
import { useShare } from "@/lib/share";

import "./index.scss";

export default function Tease() {
  const { systemConfig } = useContext(AppContext);
  const ugcEnabled = isUgcEnabled(systemConfig);
  const miniapp = getMiniappConfig(systemConfig);
  const {
    photos,
    columns,
    loading,
    error,
    hasMore,
    refreshing,
    refresh,
    loadMore,
  } = useWaterfallPhotos("tease", 3, ugcEnabled);

  useShare({
    title: "快来博Fans，跟博哥一起欢乐！",
    path: "/pages/tease/index",
    imageUrl: "https://yuanbo.online/bofans_static/images/miniapplogo.png",
  });

  useEffect(() => {
    Taro.setNavigationBarTitle({
      title: systemConfig?.inReview ? miniapp.pages.photoTitles.tease : "博逗",
    });
  }, [systemConfig]);

  return (
    <ScrollView
      scrollY
      className="tease-container photo-page"
      refresherEnabled
      enableBackToTop
      refresherTriggered={refreshing}
      onRefresherRefresh={refresh}
      onScrollToLower={loadMore}
    >
      <View className="photo-page-content">
        <BoSheng boxStyle={{ padding: "10px 0 10px" }} />
        {ugcEnabled ? (
          <WaterfallPhotoGrid
            photos={photos}
            columns={columns}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onRetry={refresh}
          />
        ) : (
          <UgcDisabledState systemConfig={systemConfig} />
        )}
      </View>
    </ScrollView>
  );
}
