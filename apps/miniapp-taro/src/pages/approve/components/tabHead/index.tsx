import { View, Text } from "@tarojs/components";
import type { UploadedPhotoStatusFilter } from "@mono/types";
import type { UploadHistoryState } from "@/features/upload/use-upload-history";
import "./index.scss";

export type ApprovalTab = {
  label: string;
  value: UploadedPhotoStatusFilter;
};

export const approveTabs: ApprovalTab[] = [
  {
    label: "审核中",
    value: "pending",
  },
  {
    label: "已通过",
    value: "approved",
  },
];

type TabHeadProps = {
  active: UploadedPhotoStatusFilter;
  queues: Record<UploadedPhotoStatusFilter, UploadHistoryState>;
  onClick: (value: UploadedPhotoStatusFilter) => void;
};

function getQueueBadge(queue: UploadHistoryState) {
  if (queue.error) return "重试";
  if (queue.loading && queue.items.length === 0) return "加载";
  return queue.total ? String(queue.total) : "无";
}

export default function TabHead({ active, queues, onClick }: TabHeadProps) {
  return (
    <View className="tab-head">
      {approveTabs.map((tab) => {
        const current = active === tab.value;
        const queue = queues[tab.value];
        return (
          <View
            key={tab.value}
            className={`${current ? "current-tab" : "default-tab"} tab-block`}
            onClick={() => onClick(tab.value)}
          >
            <View className={`head-icon head-icon-${tab.value}`}>
              <View className="head-icon-mark"></View>
            </View>
            <Text className="tab-title">{tab.label}</Text>
            <Text className="approve-num">{getQueueBadge(queue)}</Text>
          </View>
        );
      })}
    </View>
  );
}
