import { Component } from "react";
import Taro from "@tarojs/taro";
import { CoverView, CoverImage } from "@tarojs/components";

import "./index.scss";

export default class Index extends Component {
  state = {
    selected: 0,
    color: "#000000",
    selectedColor: "#DC143C",
    list: [
      {
        pagePath: "/pages/kowtow/index",
        selectedIconPath: "../images/tabbar_kowtow_on.png",
        iconPath: "../images/tabbar_kowtow.png",
        text: "磕",
      },
      {
        pagePath: "/pages/history/index",
        selectedIconPath: "../images/tabbar_history_on.png",
        iconPath: "../images/tabbar_history.png",
        text: "史",
      },
      {
        pagePath: "/pages/travel/index",
        selectedIconPath: "../images/tabbar_travel_on.png",
        iconPath: "../images/tabbar_travel.png",
        text: "游",
      },
      {
        pagePath: "/pages/tease/index",
        selectedIconPath: "../images/tabbar_tease_on.png",
        iconPath: "../images/tabbar_tease.png",
        text: "逗",
      },
      {
        pagePath: "/pages/my/index",
        selectedIconPath: "../images/tabbar_my_on.png",
        iconPath: "../images/tabbar_my.png",
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
              {/* <CoverImage src={selected === index ? item.selectedIconPath : item.iconPath} /> */}
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
