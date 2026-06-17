import { View, Text } from "@tarojs/components";
import type { UploadedPhotoStatusFilter } from "@mono/types";
import "./index.scss";

export type ApprovalTab = {
  label: string;
  value: UploadedPhotoStatusFilter;
  glyph: string;
};

export const approveTabs: ApprovalTab[] = [
  {
    label: "审核中",
    value: "pending",
    glyph: "审",
  },
  {
    label: "已通过",
    value: "approved",
    glyph: "通",
  },
];

type TabHeadProps = {
  active: UploadedPhotoStatusFilter;
  counts: Record<UploadedPhotoStatusFilter, number>;
  onClick: (value: UploadedPhotoStatusFilter) => void;
};

export default function TabHead({ active, counts, onClick }: TabHeadProps) {
  return (
    <View className="tab-head">
      {approveTabs.map((tab) => {
        const current = active === tab.value;
        return (
          <View
            key={tab.value}
            className={`${current ? "current-tab" : "default-tab"} tab-block`}
            onClick={() => onClick(tab.value)}
          >
            <View className="head-icon">{tab.glyph}</View>
            <Text className="tab-title">{tab.label}</Text>
            <Text className="approve-num">{counts[tab.value] || 0}</Text>
          </View>
        );
      })}
    </View>
  );
}
