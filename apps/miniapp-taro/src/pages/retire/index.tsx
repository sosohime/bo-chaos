import { Button, ScrollView, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useMemo, useState } from "react";
import { tuixiu } from "@mono/const";
import { dayjs } from "@mono/utils";
import { useShare } from "@/lib/share";

import "./index.scss";

type CountdownParts = {
  totalMs: number;
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
  percent: number;
  remainingPercent: number;
};

const BO_RETIRE_START = tuixiu.boTuiXiuStartDay;
const BO_RETIRE_TARGET = tuixiu.boTuiXiuDay;
const RETIRE_DATE_FORMAT = "YYYY-MM-DD";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getCountdownParts(): CountdownParts {
  const now = dayjs();
  const totalMs = Math.max(0, BO_RETIRE_TARGET.diff(now));
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = pad(Math.floor((totalSeconds % 86400) / 3600));
  const minutes = pad(Math.floor((totalSeconds % 3600) / 60));
  const seconds = pad(totalSeconds % 60);
  const elapsed = Math.max(0, now.diff(BO_RETIRE_START));
  const total = Math.max(1, BO_RETIRE_TARGET.diff(BO_RETIRE_START));
  const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
  return {
    totalMs,
    days,
    hours,
    minutes,
    seconds,
    percent,
    remainingPercent: 100 - percent,
  };
}

export default function Retire() {
  const [countdown, setCountdown] =
    useState<CountdownParts>(getCountdownParts());

  useShare({
    title: "博退休进度站",
    path: "/pages/retire/index",
    imageUrl: "https://yuanbo.online/bofans_static/images/miniapplogo.png",
  });

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdownParts()), 1000);
    return () => clearInterval(timer);
  }, []);

  const shareCopy = useMemo(
    () =>
      `距离博退休还有 ${countdown.days} 天 ${countdown.hours}:${countdown.minutes}:${countdown.seconds}，目标日 ${BO_RETIRE_TARGET.format(RETIRE_DATE_FORMAT)}`,
    [countdown],
  );

  const copyCountdown = async () => {
    await Taro.setClipboardData({ data: shareCopy });
  };

  const goKowtow = () => {
    Taro.switchTab({ url: "/pages/kowtow/index" });
  };

  return (
    <ScrollView scrollY className="retire-scroll" enableBackToTop>
      <View className="retire-page">
        <View className="retire-hero">
          <View className="retire-orbit">
            <View className="retire-orbit-ring" />
            <View className="retire-orbit-core">BO</View>
          </View>
          <Text className="retire-eyebrow">RETIREMENT CONTROL</Text>
          <Text className="retire-title">博退休倒计时</Text>
          <Text className="retire-subtitle">
            目标日与退休站保持一致，实时更新剩余时间。
          </Text>
        </View>

        <View className="retire-panel">
          <View className="retire-panel-head">
            <Text>距离退休还有</Text>
            <Text>{BO_RETIRE_TARGET.format(RETIRE_DATE_FORMAT)}</Text>
          </View>
          <View className="retire-days">
            <Text className="retire-days-number">{countdown.days}</Text>
            <Text className="retire-days-unit">天</Text>
          </View>
          <View className="retire-clock">
            <Text>{countdown.hours}</Text>
            <Text>:</Text>
            <Text>{countdown.minutes}</Text>
            <Text>:</Text>
            <Text>{countdown.seconds}</Text>
          </View>
          <View className="retire-progress">
            <View
              className="retire-progress-fill"
              style={{ width: `${countdown.percent}%` }}
            />
          </View>
          <View className="retire-progress-meta">
            <Text>退休进度 {countdown.percent.toFixed(2)}%</Text>
            <Text>
              {countdown.totalMs === 0
                ? "已抵达"
                : `剩余 ${countdown.remainingPercent.toFixed(2)}%`}
            </Text>
          </View>
          <View className="retire-progress-scale">
            <Text>已完成</Text>
            <Text>{BO_RETIRE_TARGET.format(RETIRE_DATE_FORMAT)}</Text>
          </View>
        </View>

        <View className="retire-actions">
          <Button className="retire-primary" onClick={copyCountdown}>
            复制进度
          </Button>
          <Button className="retire-secondary" onClick={goKowtow}>
            去磕一发
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
