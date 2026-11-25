import Taro from "@tarojs/taro";

const seenKey = "group-rank-return-guide-v1";

export async function showGroupReturnHelp() {
  return Taro.showModal({
    title: "怎么回到榜单？",
    content:
      "在原来的群里，点聊天里的小本儿卡片。找不到？请群友再发一张。\n\n群工具里有小本儿，也能从那里进。",
    showCancel: false,
    confirmText: "知道了",
  });
}

export async function offerGroupReturnHelp() {
  try {
    if (Taro.getStorageSync(seenKey)) return;
  } catch {
    /* A storage failure must not block a successful score submission. */
  }
  try {
    const result = await showGroupReturnHelp();
    if (result.confirm) Taro.setStorageSync(seenKey, true);
  } catch {
    /* This optional hint must never turn a successful write into an error. */
  }
}
