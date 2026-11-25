import type { PropsWithChildren } from "react";
import { useDidHide, useDidShow } from "@tarojs/taro";
import { invalidateGroupSession } from "./lib/api";
import { resetEntryNavigation } from "./lib/entry";
import { nativeMediaAppHidden, nativeMediaAppShown } from "./lib/native-media";
import "./app.scss";

export default function App({ children }: PropsWithChildren) {
  useDidShow((options) => {
    const returningFromMedia = nativeMediaAppShown(options);
    invalidateGroupSession();
    if (!returningFromMedia) resetEntryNavigation();
  });
  useDidHide(nativeMediaAppHidden);
  return children;
}
