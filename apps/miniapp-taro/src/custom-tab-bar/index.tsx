import { Component } from "react";
import Taro from "@tarojs/taro";
import { CoverView, CoverImage } from "@tarojs/components";

import "./index.scss";
import KowtowIcon from "../images/tab-bar/kowtow.png";
import KowtowActiveIcon from "../images/tab-bar/kowtow-active.png";
import TravelIcon from "../images/tab-bar/travel.png";
import TravelActiveIcon from "../images/tab-bar/travel-active.png";
import HistoryIcon from "../images/tab-bar/history.png";
import HistoryActiveIcon from "../images/tab-bar/history-active.png";
import MyIcon from "../images/tab-bar/my.png";
import MyActiveIcon from "../images/tab-bar/my-active.png";
import TeaseIcon from "../images/tab-bar/tease.png";
import TeaseActiveIcon from "../images/tab-bar/tease-active.png";

export default class Index extends Component {
  state = {
    selected: 0,
    color: "#000000",
    selectedColor: "#0052d9",
    list: [
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
        pagePath: "/pages/tease/index",
        iconPath: TeaseIcon,
        selectedIconPath: TeaseActiveIcon,
        text: "逗",
      },
      {
        pagePath: "/pages/my/index",
        iconPath: MyIcon,
        selectedIconPath: MyActiveIcon,
        text: "我",
      },
    ],
  };

  switchTab(index, url) {
    this.setSelected(index);
    Taro.switchTab({ url });
  }

  setSelected(idx: number) {
    this.setState({
      selected: idx,
    });
  }

  render() {
    const { list, selected, color, selectedColor } = this.state;

    return (
      <CoverView className="tab-bar">
        <CoverView className="tab-bar-border"></CoverView>
        {list.map((item, index) => {
          return (
            <CoverView
              key={index}
              className="tab-bar-item"
              onClick={this.switchTab.bind(this, index, item.pagePath)}
            >
              <CoverImage
                src={selected === index ? item.selectedIconPath : item.iconPath}
              />
              <CoverView
                style={{ color: selected === index ? selectedColor : color }}
              >
                {item.text}
              </CoverView>
            </CoverView>
          );
        })}
      </CoverView>
    );
  }
}
