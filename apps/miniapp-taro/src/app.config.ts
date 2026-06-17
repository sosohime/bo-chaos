export const tabBarList = [
  {
    pagePath: "pages/retire/index",
    text: "退休",
    iconPath: "images/tab-bar/retire.png",
    selectedIconPath: "images/tab-bar/retire-active.png",
  },
  {
    pagePath: "pages/kowtow/index",
    text: "磕袁",
    iconPath: "images/tab-bar/kowtow.png",
    selectedIconPath: "images/tab-bar/kowtow-active.png",
  },
  {
    pagePath: "pages/history/index",
    text: "博史",
    iconPath: "images/tab-bar/history.png",
    selectedIconPath: "images/tab-bar/history-active.png",
  },
  {
    pagePath: "pages/travel/index",
    text: "旅行",
    iconPath: "images/tab-bar/travel.png",
    selectedIconPath: "images/tab-bar/travel-active.png",
  },
  {
    pagePath: "pages/my/index",
    text: "我的",
    iconPath: "images/tab-bar/my.png",
    selectedIconPath: "images/tab-bar/my-active.png",
  },
];

export default defineAppConfig({
  lazyCodeLoading: "requiredComponents",
  pages: [
    "pages/retire/index",
    "pages/kowtow/index",
    "pages/history/index",
    "pages/travel/index",
    "pages/tease/index",
    "pages/my/index",
    "pages/approve/index",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#f7fbff",
    navigationBarTitleText: "Bo Fans",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    custom: true,
    color: "#5d6f8f",
    selectedColor: "#0052d9",
    backgroundColor: "#ffffff",
    borderStyle: "white",
    list: tabBarList,
  },
});
