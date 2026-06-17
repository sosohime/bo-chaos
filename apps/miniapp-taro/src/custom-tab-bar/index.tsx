import { useContext } from "react";
import Taro from "@tarojs/taro";
import { CoverView, CoverImage } from "@tarojs/components";
import { AppContext } from "../lib/context";

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
    pagePath: "/pages/retire/index",
    iconPath: RetireIcon,
    selectedIconPath: RetireActiveIcon,
    text: "退",
  },
  {
    pagePath: "/pages/kowtow/index",
    iconPath: KowtowIcon,
    selectedIconPath: KowtowActiveIcon,
    text: "磕",
  },
  {
    pagePath: "/pages/history/index",
    iconPath: HistoryIcon,
    selectedIconPath: HistoryActiveIcon,
    text: "史",
  },
  {
    pagePath: "/pages/travel/index",
    iconPath: TravelIcon,
    selectedIconPath: TravelActiveIcon,
    text: "游",
  },
  {
    pagePath: "/pages/my/index",
    iconPath: MyIcon,
    selectedIconPath: MyActiveIcon,
    text: "我",
  },
];

export default function TabBar() {
  const { selectedTab, setSelectedTab } = useContext(AppContext);
  const color = "#7f91aa";
  const selectedColor = "#67e8f9";

  const switchTab = (index: number, url: string) => {
    setSelectedTab(index);
    Taro.switchTab({ url });
  };

  return (
    <CoverView className="tab-bar">
      <CoverView className="tab-bar-border"></CoverView>
      {list.map((item, index) => (
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
            {item.text}
          </CoverView>
        </CoverView>
      ))}
    </CoverView>
  );
}
