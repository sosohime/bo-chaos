import { View, Image, Text } from "@tarojs/components";
import type { UploadedPhotoStatusFilter } from "@mono/types";
import "./index.scss";
import pendingIcon from "@/images/approve/peding_icon.png";
import pendingTodoIcon from "@/images/approve/peding_todo_icon.png";
import approved from "@/images/approve/approved_icon.png";
import approvedTodo from "@/images/approve/approved_todo_icon.png";

export type ApprovalTab = {
  label: string;
  value: UploadedPhotoStatusFilter;
  icon: string;
  currentIcon: string;
};

export const approveTabs: ApprovalTab[] = [
  {
    label: "审核中",
    value: "pending",
    icon: pendingTodoIcon,
    currentIcon: pendingIcon,
  },
  {
    label: "已通过",
    value: "approved",
    icon: approvedTodo,
    currentIcon: approved,
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
            <Image
              src={current ? tab.currentIcon : tab.icon}
              className="head-icon"
            />
            <Text className="tab-title">{tab.label}</Text>
            <Text className="approve-num">{counts[tab.value] || 0}</Text>
          </View>
        );
      })}
    </View>
  );
}
