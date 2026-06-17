import { useContext } from "react";
import Taro from "@tarojs/taro";
import { CoverView } from "@tarojs/components";
import { AppContext } from "../lib/context";
import { getMiniappConfig, isUgcEnabled } from "@/lib/runtime-config";

import "./index.scss";

const list = [
  {
    key: "retire",
    pagePath: "/pages/retire/index",
    text: "退",
    glyph: "T",
  },
  {
    key: "kowtow",
    pagePath: "/pages/kowtow/index",
    text: "磕",
    glyph: "K",
  },
  {
    key: "history",
    pagePath: "/pages/history/index",
    text: "史",
    glyph: "H",
  },
  {
    key: "travel",
    pagePath: "/pages/travel/index",
    text: "游",
    glyph: "Y",
  },
  {
    key: "my",
    pagePath: "/pages/my/index",
    text: "我",
    glyph: "M",
  },
];

export default function TabBar() {
  const { selectedTab, setSelectedTab, systemConfig } = useContext(AppContext);
  const color = "#5d6f8f";
  const selectedColor = "#0052d9";
  const miniapp = getMiniappConfig(systemConfig);
  const ugcEnabled = isUgcEnabled(systemConfig);
  const visibleTabs = list.filter((item) => {
    if (!ugcEnabled && ["history", "travel"].includes(item.key)) {
      return false;
    }
    return miniapp.tabs[item.key].visible !== false;
  });

  const switchTab = (index: number, url: string) => {
    setSelectedTab(index);
    Taro.switchTab({ url });
  };

  return (
    <CoverView className="tab-bar">
      <CoverView className="tab-bar-border"></CoverView>
      {visibleTabs.map((item, index) => (
        <CoverView
          key={index}
          className={`tab-bar-item ${selectedTab === index ? "active" : ""}`}
          onClick={() => switchTab(index, item.pagePath)}
        >
          <CoverView className="tab-bar-icon">
            <CoverView className="tab-bar-icon-core">{item.glyph}</CoverView>
          </CoverView>
          <CoverView
            className="tab-bar-label"
            style={{ color: selectedTab === index ? selectedColor : color }}
          >
            {miniapp.tabs[item.key].text || item.text}
          </CoverView>
        </CoverView>
      ))}
    </CoverView>
  );
}
