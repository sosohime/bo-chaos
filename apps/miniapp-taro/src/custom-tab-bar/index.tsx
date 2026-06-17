import { useContext } from "react";
import Taro from "@tarojs/taro";
import { CoverView, CoverImage } from "@tarojs/components";
import { AppContext } from "../lib/context";
import { getMiniappConfig, isUgcEnabled } from "@/lib/runtime-config";

import "./index.scss";
import RetireIcon from "../images/tab-bar/retire.png";
import RetireActiveIcon from "../images/tab-bar/retire-active.png";
import KowtowIcon from "../images/tab-bar/kowtow.png";
import KowtowActiveIcon from "../images/tab-bar/kowtow-active.png";
import TravelIcon from "../images/tab-bar/travel.png";
import TravelActiveIcon from "../images/tab-bar/travel-active.png";
import HistoryIcon from "../images/tab-bar/history.png";
import HistoryActiveIcon from "../images/tab-bar/history-active.png";
import MyIcon from "../images/tab-bar/my.png";
import MyActiveIcon from "../images/tab-bar/my-active.png";

const list = [
  {
    key: "retire",
    pagePath: "/pages/retire/index",
    iconPath: RetireIcon,
    selectedIconPath: RetireActiveIcon,
    text: "退",
  },
  {
    key: "kowtow",
    pagePath: "/pages/kowtow/index",
    iconPath: KowtowIcon,
    selectedIconPath: KowtowActiveIcon,
    text: "磕",
  },
  {
    key: "history",
    pagePath: "/pages/history/index",
    iconPath: HistoryIcon,
    selectedIconPath: HistoryActiveIcon,
    text: "史",
  },
  {
    key: "travel",
    pagePath: "/pages/travel/index",
    iconPath: TravelIcon,
    selectedIconPath: TravelActiveIcon,
    text: "游",
  },
  {
    key: "my",
    pagePath: "/pages/my/index",
    iconPath: MyIcon,
    selectedIconPath: MyActiveIcon,
    text: "我",
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
          className="tab-bar-item"
          onClick={() => switchTab(index, item.pagePath)}
        >
          <CoverImage
            className="tab-bar-icon"
            src={selectedTab === index ? item.selectedIconPath : item.iconPath}
          />
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
