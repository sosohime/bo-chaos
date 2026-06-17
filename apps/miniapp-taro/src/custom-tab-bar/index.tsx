import { useContext } from "react";
import Taro from "@tarojs/taro";
import { CoverImage, CoverView } from "@tarojs/components";
import { AppContext } from "../lib/context";
import type { MiniappTabKey } from "../lib/context";
import { getMiniappConfig, isUgcEnabled } from "@/lib/runtime-config";
import historyIcon from "@/images/tab-bar/history.png";
import historyIconActive from "@/images/tab-bar/history-active.png";
import kowtowIcon from "@/images/tab-bar/kowtow.png";
import kowtowIconActive from "@/images/tab-bar/kowtow-active.png";
import myIcon from "@/images/tab-bar/my.png";
import myIconActive from "@/images/tab-bar/my-active.png";
import retireIcon from "@/images/tab-bar/retire.png";
import retireIconActive from "@/images/tab-bar/retire-active.png";
import travelIcon from "@/images/tab-bar/travel.png";
import travelIconActive from "@/images/tab-bar/travel-active.png";

import "./index.scss";

const list = [
  {
    key: "retire" as const,
    pagePath: "/pages/retire/index",
    text: "退休",
    icon: retireIcon,
    activeIcon: retireIconActive,
  },
  {
    key: "kowtow" as const,
    pagePath: "/pages/kowtow/index",
    text: "磕袁",
    icon: kowtowIcon,
    activeIcon: kowtowIconActive,
  },
  {
    key: "history" as const,
    pagePath: "/pages/history/index",
    text: "博史",
    icon: historyIcon,
    activeIcon: historyIconActive,
  },
  {
    key: "travel" as const,
    pagePath: "/pages/travel/index",
    text: "旅行",
    icon: travelIcon,
    activeIcon: travelIconActive,
  },
  {
    key: "my" as const,
    pagePath: "/pages/my/index",
    text: "我的",
    icon: myIcon,
    activeIcon: myIconActive,
  },
];

function getCurrentTabKey(): MiniappTabKey | null {
  const pages = Taro.getCurrentPages?.() || [];
  const currentRoute = pages[pages.length - 1]?.route;
  if (!currentRoute) return null;
  const matched = list.find(
    (item) => item.pagePath.replace(/^\//, "") === currentRoute,
  );
  return matched?.key || null;
}

export default function TabBar() {
  const { selectedTab, setSelectedTab, systemConfig } = useContext(AppContext);
  const miniapp = getMiniappConfig(systemConfig);
  const ugcEnabled = isUgcEnabled(systemConfig);
  const visibleTabs = list.filter((item) => {
    if (!ugcEnabled && ["history", "travel"].includes(item.key)) {
      return false;
    }
    return miniapp.tabs[item.key].visible !== false;
  });
  const activeTab = getCurrentTabKey() || selectedTab;

  const switchTab = (key: MiniappTabKey, url: string) => {
    setSelectedTab(key);
    Taro.switchTab({ url });
  };

  return (
    <CoverView className="tab-bar">
      <CoverView className="tab-bar-border"></CoverView>
      {visibleTabs.map((item) => {
        const active = activeTab === item.key;
        return (
          <CoverView
            key={item.key}
            className={`tab-bar-item ${active ? "active" : ""}`}
            onClick={() => switchTab(item.key, item.pagePath)}
          >
            <CoverView className="tab-bar-control">
              <CoverView className="tab-bar-indicator"></CoverView>
              <CoverView className="tab-bar-icon-shell">
                <CoverImage
                  className="tab-bar-icon"
                  src={active ? item.activeIcon : item.icon}
                />
              </CoverView>
              <CoverView className="tab-bar-label">
                {miniapp.tabs[item.key].text || item.text}
              </CoverView>
            </CoverView>
          </CoverView>
        );
      })}
    </CoverView>
  );
}
