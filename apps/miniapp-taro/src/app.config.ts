export default defineAppConfig({
  pages: [
    "pages/kowtow/index",
    "pages/history/index",
    "pages/travel/index",
    "pages/tease/index",
    "pages/my/index",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#0052d9",
    navigationBarTitleText: "Bo Fans",
    navigationBarTextStyle: "white",
  },
  tabBar: {
    custom: true,
    color: "#000000",
    selectedColor: "#000000",
    backgroundColor: "#000000",
    list: [
      {
        pagePath: "pages/kowtow/index",
        text: "磕",
      },
      {
        pagePath: "pages/history/index",
        text: "史",
      },
      {
        pagePath: "pages/travel/index",
        text: "游",
      },
      {
        pagePath: "pages/tease/index",
        text: "逗",
      },
      {
        pagePath: "pages/my/index",
        text: "我",
      },
    ],
  },
});
