import { View, Button, Image, Text, Canvas } from "@tarojs/components";
import { useState, useEffect, useRef, useContext } from "react";
import Taro from "@tarojs/taro";
import BoSheng from "@/components/boSheng";
import { AppContext } from "@/lib/context";
import { useShare } from "@/lib/share";
import useLocalStorage from "@/hooks/use-local-storage";
import { getKowtowStats, batchKowtow } from "../../api/kowtow";
import "./index.scss";
import God from "../../images/god.png";
interface KowtowStats {
  todayKowtowedUser: number | "-";
  totalCount: number | "-";
  iKowtowedToday: boolean;
}
export default function Kowtow() {
  const [kowtowCount, setKowtowCount] = useLocalStorage<number>(
    "nowKowtowCount",
    0,
  );
  const kowtowCountRef = useRef(kowtowCount);
  // 同步更新 ref
  useEffect(() => {
    kowtowCountRef.current = kowtowCount;
  }, [kowtowCount]);

  const { systemConfig } = useContext(AppContext);
  const [kowtowStats, setKowtowStats] = useState<KowtowStats>({
    todayKowtowedUser: "-",
    totalCount: "-",
    iKowtowedToday: false,
  });

  useEffect(() => {
    if (systemConfig && Object.keys(systemConfig).length) {
      Taro.setNavigationBarTitle({
        title: systemConfig.inReview ? "博Fans图片压缩工具简介" : "磕袁",
      });
    }
  }, [systemConfig]);

  useShare({
    title: "快来博Fans，今天你磕了吗？",
    path: "/pages/kowtow/index",
    imageUrl: "https://yuanbo.online/bofans_static/images/miniapplogo.png",
  });

  function handleKowtow() {
    createLikeAnimation();
    setKowtowCount(kowtowCount + 1);
  }
  // 每隔两秒调用一次，查询最新磕头状态
  useEffect(() => {
    const timer = setInterval(async () => {
      let batch = false;
      // 存在待提交磕头数，提交至库中
      const paramsKowtow = kowtowCountRef.current;
      if (kowtowCountRef.current > 0) {
        await batchKowtow({ count: paramsKowtow })
          .then(() => {
            batch = true;
          })
          .catch((e) => {
            console.log(`Error=>${e}`);
          });
      }
      await getKowtowStats().then((data: KowtowStats) => {
        setKowtowStats(data);
        const nowKowtow = Taro.getStorageSync("nowKowtowCount");
        if (batch) setKowtowCount(nowKowtow - paramsKowtow);
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const animationQueue = useRef<number[]>([]);
  // 点赞图标库
  const godIcon = [
    "🌼",
    "👍",
    "🌹",
    "🚀",
    "⭐",
    "😻",
    "🦄",
    "🥳",
    "🧸",
    "🧨",
    "❤️",
    "💕",
    "🍔",
  ];

  useEffect(() => {
    // 初始化 canvas context
    const query = Taro.createSelectorQuery();
    query
      .select("#god-bo-canvas")
      .fields({ node: true, size: true })
      .exec((res) => {
        // const canvas = res[0]?.node;
        // const ctx = canvas?.getContext("2d");
        // const dpr = Taro.getSystemInfoSync().pixelRatio;
        // canvas.width = res[0].width * dpr;
        // canvas.height = res[0].height * dpr;
        // ctx.scale(dpr, dpr);
      });
  }, []);

  // 创建点赞动画
  const createLikeAnimation = () => {
    let currentNumber = Math.floor(Math.random() * 12);
    const query = Taro.createSelectorQuery();
    query
      .select("#god-bo-canvas")
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        if (!canvas) {
          return;
        }
        const ctx = canvas.getContext("2d");

        const startX = canvas.width / 8;
        const startY = canvas.height - 20;
        const animationId = Date.now();

        let opacity = 1;
        let y = startY;

        const animate = () => {
          // 清除这个动画的路径
          ctx.clearRect(startX - 48, y - 48, 384, 96);

          y -= 2; // 向上移动
          opacity -= 0.02; // 逐渐变透明

          if (opacity > 0) {
            ctx.save();
            ctx.font = "48px serif";
            ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
            ctx.textAlign = "center";
            ctx.scale(4, 1);
            ctx.fillText(godIcon[currentNumber], startX, y);
            ctx.restore();

            requestAnimationFrame(animate);
          } else {
            // 动画结束，从队列中移除
            animationQueue.current = animationQueue.current.filter(
              (id) => id !== animationId,
            );
          }
        };

        // 将动画添加到队列
        animationQueue.current.push(animationId);
        animate();
      });
  };
  return (
    <View className="kowtow-container">
      {systemConfig &&
      Object.keys(systemConfig).length &&
      systemConfig.inReview ? (
        <>
          <Text>HI, 博Fans</Text>
          <Text>欢迎使用BoFans图片压缩工具</Text>
          <Text>请在个人中心（我）</Text>
          <Text>选择需要处理的图片分类，以及上传图片</Text>
          <Text>带管理员审核通过后，会自动执行压缩流程</Text>
        </>
      ) : (
        <>
          <BoSheng />
          <Text>
            全球博粉累计磕头{" "}
            {kowtowCount && kowtowStats.totalCount !== "-"
              ? (kowtowStats.totalCount as number) + kowtowCount
              : kowtowStats.totalCount}{" "}
            次
          </Text>
          <Text>
            今日签到博粉 {kowtowStats.todayKowtowedUser}{" "}
            <Text className="utc">(utc+8)</Text>
          </Text>
          <View className="god-bo">
            <Canvas type="2d" id="god-bo-canvas" className="canvas" />
            <Image src={God}></Image>
          </View>
          <Text className="love">博爱世人</Text>
          {kowtowStats.totalCount !== "-" && (
            <Text>
              {kowtowStats.iKowtowedToday
                ? "今日已磕，博哥对你很满意👍"
                : "今天你还没磕，抓紧"}
            </Text>
          )}
          <Button
            className="submit-kowtow"
            type="primary"
            onClick={handleKowtow}
          >
            磕
          </Button>
        </>
      )}
    </View>
  );
}
