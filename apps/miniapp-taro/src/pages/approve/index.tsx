import Taro from "@tarojs/taro";
import { useContext, useMemo, useState } from "react";
import { Image, ScrollView, Text, View } from "@tarojs/components";
import type { UploadedPhotoStatusFilter } from "@mono/types";
import UgcDisabledState from "@/features/photos/UgcDisabledState";
import { useUploadHistory } from "@/features/upload/use-upload-history";
import { AppContext } from "@/lib/context";
import { isUgcEnabled } from "@/lib/runtime-config";
import { normalizeMediaUrl, normalizeMediaUrls } from "@/lib/media-url";
import "./index.scss";
import TabHead from "./components/tabHead";

function getInitialTab(): UploadedPhotoStatusFilter {
  const approval = Taro.getCurrentInstance()?.router?.params
    ?.approval as UploadedPhotoStatusFilter;
  return approval === "approved" ? "approved" : "pending";
}

export default function ApprovalPage() {
  const { systemConfig } = useContext(AppContext);
  const ugcEnabled = isUgcEnabled(systemConfig);
  const [activeTab, setActiveTab] =
    useState<UploadedPhotoStatusFilter>(getInitialTab);
  const pending = useUploadHistory("pending", ugcEnabled);
  const approved = useUploadHistory("approved", ugcEnabled);
  const active = activeTab === "pending" ? pending : approved;
  const counts = useMemo(
    () => ({
      pending: pending.total,
      approved: approved.total,
    }),
    [pending.total, approved.total],
  );
  const activeTotal = counts[activeTab] || 0;
  const queueLabel = activeTab === "pending" ? "审核中" : "已通过";
  const queueStage = active.loading
    ? "加载中"
    : active.error
      ? "需重试"
      : active.hasMore
        ? "可继续加载"
        : "已加载完";

  const onRefresh = async () => {
    try {
      Taro.showNavigationBarLoading();
      await active.refresh();
      Taro.showToast({ title: "刷新成功", icon: "success" });
    } catch {
      Taro.showToast({ title: "刷新失败", icon: "none" });
    } finally {
      Taro.hideNavigationBarLoading();
    }
  };

  return (
    <View className="approval-page">
      <TabHead active={activeTab} counts={counts} onClick={setActiveTab} />
      {!ugcEnabled ? (
        <UgcDisabledState systemConfig={systemConfig} />
      ) : (
        <ScrollView
          scrollY
          className="approval-container"
          refresherEnabled
          enableBackToTop
          refresherTriggered={active.refreshing}
          onRefresherRefresh={onRefresh}
          onScrollToLower={active.loadMore}
        >
          <View className="approval-console-head">
            <View>
              <Text className="approval-console-kicker">审核队列</Text>
              <Text className="approval-console-title">
                {activeTab === "pending" ? "待处理图片" : "已通过图片"}
              </Text>
              <Text className="approval-console-subtitle">
                当前队列：{queueLabel}
              </Text>
            </View>
            <Text className="approval-console-status">
              {active.loading ? "加载中" : `${activeTotal} 项`}
            </Text>
          </View>
          <View className="approval-summary">
            <View className="approval-summary-item primary">
              <Text className="approval-summary-label">队列状态</Text>
              <Text className="approval-summary-value">{queueStage}</Text>
            </View>
            <View className="approval-summary-item">
              <Text className="approval-summary-label">审核中</Text>
              <Text className="approval-summary-value">
                {counts.pending || 0}
              </Text>
            </View>
            <View className="approval-summary-item">
              <Text className="approval-summary-label">已通过</Text>
              <Text className="approval-summary-value">
                {counts.approved || 0}
              </Text>
            </View>
          </View>
          {active.items.length === 0 && active.loading && (
            <View className="approval-state">
              <Text className="approval-state-kicker">队列加载</Text>
              <Text className="approval-state-title">加载中</Text>
              <Text className="approval-state-copy">正在获取当前审核队列</Text>
            </View>
          )}
          {active.items.length === 0 && !active.loading && (
            <View className="approval-state">
              <Text className="approval-state-kicker">
                {active.error ? "加载异常" : "队列状态"}
              </Text>
              <Text className="approval-state-title">
                {active.error ? "加载失败" : "这里还没有图片"}
              </Text>
              <Text className="approval-state-copy">
                {active.error ? "下拉重试当前队列" : "当前队列暂无图片"}
              </Text>
            </View>
          )}
          {active.items.length > 0 && (
            <View className="approval-panel">
              <View className="approval-panel-head">
                <View>
                  <Text className="approval-panel-kicker">图片列表</Text>
                  <Text className="approval-panel-title">{queueLabel}</Text>
                </View>
                <Text>{queueStage}</Text>
              </View>
              <View className="approval-grid">
                {active.items.map((photo) => (
                  <View key={photo.id} className="approval-card">
                    <View className="approval-image-wrap">
                      <Image
                        src={normalizeMediaUrl(photo.filename)}
                        mode="aspectFill"
                        lazyLoad
                        className="approval-image"
                        onClick={() =>
                          Taro.previewImage({
                            current: normalizeMediaUrl(photo.filename),
                            urls: normalizeMediaUrls(
                              active.items.map((item) => item.filename),
                            ),
                          })
                        }
                      />
                    </View>
                    <View className="approval-meta">
                      <Text className="approval-category">
                        {photo.name || photo.category?.name || "图片"}
                      </Text>
                      <Text className="approval-subcategory">
                        {photo.category?.name || "未分类"}
                      </Text>
                    </View>
                    <View className="approval-card-foot">
                      <Text className={`approval-status ${activeTab}`}>
                        {activeTab === "pending" ? "审核中" : "已通过"}
                      </Text>
                      <Text className="approval-card-id">#{photo.id}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
          {active.items.length > 0 && (
            <View className="approval-footer">
              <Text>
                {active.loading
                  ? "继续加载..."
                  : active.hasMore
                    ? "上拉加载更多"
                    : "已加载全部"}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
