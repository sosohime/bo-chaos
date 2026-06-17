import { View, Button, Text, Canvas } from "@tarojs/components";
import { useState, useEffect, useRef, useContext } from "react";
import Taro from "@tarojs/taro";
import BoSheng from "@/components/boSheng";
import { AppContext } from "@/lib/context";
import { useShare } from "@/lib/share";
import useLocalStorage from "@/hooks/use-local-storage";
import God from "@/images/kowtow/god.png";
import God2 from "@/images/kowtow/god2.jpg";
import God3 from "@/images/kowtow/god3.png";
import { getKowtowStats, batchKowtow } from "../../api/kowtow";
import type { KowtowStatsDto } from "@mono/types";
import SwiperImg from "@/components/swiperImg";
import "./index.scss";
type KowtowStats = Omit<KowtowStatsDto, "todayKowtowedUser" | "totalCount"> & {
  todayKowtowedUser: number | "-";
  totalCount: number | "-";
};
interface Animation {
  id: number;
  x: number;
  y: number;
  text: string;
  opacity: number;
}
export default function Kowtow() {
  const [kowtowCount, setKowtowCount] = useLocalStorage<number>(
    "nowKowtowCount",
    0,
  );
  const swiperImages = [
    {
      img: God,
      ratio: (351 / 476).toFixed(2),
      canvas: {
        top: "15%",
        left: "68%",
        width: 90,
        height: 120,
      },
    },
    {
      img: God2,
      ratio: (256 / 388).toFixed(2),
      canvas: {
        top: "20%",
        left: "18%",
        width: 90,
        height: 120,
      },
    },
    {
      img: God3,
      ratio: (184 / 210).toFixed(2),
      canvas: {
        top: "20%",
        left: "10%",
        width: 90,
        height: 120,
      },
    },
  ];
  const [canvasInfo, setCanvasInfo] = useState({
    swiperIndex: 0,
    canvas: {
      top: "15%",
      left: "68%",
      width: 90,
      height: 120,
    },
  });
  const kowtowCountRef = useRef(kowtowCount);
  // 同步更新 ref
  useEffect(() => {
    kowtowCountRef.current = kowtowCount;
  }, [kowtowCount]);

  const animationQueue = useRef<Animation[]>([]);
  // 创捷一个动画状态 防止动画频繁添加导致速度错误
  const animationState = useRef(false);

  const { systemConfig } = useContext(AppContext);
  const [kowtowStats, setKowtowStats] = useState<KowtowStats>({
    todayKowtowedUser: "-",
    totalCount: "-",
    iKowtowedToday: false,
  });
  const [syncFailed, setSyncFailed] = useState(false);
  const [isKowtowing, setIsKowtowing] = useState(false);

  useEffect(() => {
    if (systemConfig) {
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
  const handleKowtow = async () => {
    if (isKowtowing) return;
    setIsKowtowing(true);
    try {
      await createLikeAnimation();
      await setKowtowCount(kowtowCount + 1);
    } catch (error) {
      console.error("磕头动画失败:", error);
    } finally {
      setIsKowtowing(false);
    }
  };

  const syncKowtowStats = async () => {
    try {
      let batchBlockData;
      const paramsKowtow = kowtowCountRef.current;
      if (paramsKowtow > 0) {
        batchBlockData = await batchKowtow({ count: paramsKowtow });
      }
      const kowtowStatsData = await getKowtowStats();
      if (kowtowStatsData) {
        setKowtowStats(kowtowStatsData);
        batchBlockData && setKowtowCount(0);
      }
      setSyncFailed(false);
    } catch (error) {
      console.error("同步磕头状态失败:", error);
      setSyncFailed(true);
    }
  };

  // 每隔两秒调用一次，查询最新磕头状态
  useEffect(() => {
    syncKowtowStats();
    const timer = setInterval(syncKowtowStats, 2000);
    return () => clearInterval(timer);
  }, []);

  // 轮播图变化 修改点赞canvas位置
  const changeSwiper = (e: number) => {
    const info = swiperImages[e];
    const { canvas } = info;
    setCanvasInfo({
      swiperIndex: e,
      canvas,
    });
  };

  // 点赞图标库
  const goodIcon = [
    "🌼",
    "👍",
    "🌹",
    "🚀",
    "⭐",
    "🦄",
    "🥳",
    "🧸",
    "🧨",
    "🤩",
    "😎",
    "🍔",
  ];

  // useEffect(() => {
  //   // 初始化 canvas context
  //   const query = Taro.createSelectorQuery();
  //   query
  //     .select("#god-bo-canvas")
  //     .fields({ node: true, size: true })
  //     .exec((res) => {
  //     });
  // }, []);
  // 创建点赞动画
  const createLikeAnimation = () => {
    let currentNumber = Math.floor(Math.random() * 12);
    const query = Taro.createSelectorQuery();
    const fontSize = 36;
    query
      .select("#god-bo-canvas")
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        if (!canvas) {
          return;
        }
        const ctx = canvas.getContext("2d");
        const xSkew = Math.ceil((Math.random() * canvas.width) / 6);
        const startX = fontSize / 2 + xSkew;
        const startY = canvas.height - 20;
        const animationId = Date.now();
        animationQueue.current.push({
          id: animationId,
          x: startX,
          y: startY,
          text: goodIcon[currentNumber],
          opacity: 1,
        });
        // image = null;
        if (animationState.current) return;
        animationState.current = true;
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
          // 更新文字阶段
          animationQueue.current = animationQueue.current.filter(
            (animation: Animation) => animation.opacity > 0,
          );
          animationQueue.current = animationQueue.current.map(
            (animation: Animation) => {
              let { id, x, y, opacity, text } = animation;
              return {
                id,
                x,
                y: (y -= 2),
                text,
                opacity: parseFloat((opacity - 0.02).toFixed(2)),
              };
            },
          );

          // 渲染文字阶段
          animationQueue.current.map((animation: Animation) => {
            // 绘制阶段
            ctx.save();
            ctx.font = `${fontSize}px serif`;
            ctx.fillStyle = `rgba(255, 0, 0, ${animation.opacity})`;
            ctx.textAlign = "center";
            ctx.scale(3, 1);
            ctx.fillText(animation.text, animation.x, animation.y);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.restore();
          });
          if (animationQueue.current.length > 0) {
            requestAnimationFrame(animate);
          } else {
            animationState.current = false;
          }
        };
        animate();
      });
  };
  return (
    <View className="kowtow-container">
      {systemConfig?.inReview ? (
        <>
          <Text className="kowtow-copy">HI, 博Fans</Text>
          <Text className="kowtow-copy">欢迎使用BoFans图片压缩工具</Text>
          <Text className="kowtow-copy">请在个人中心（我）</Text>
          <Text className="kowtow-copy">
            系统预设了一些图片分类，帮助你进行图片整理
          </Text>
          <Text className="kowtow-copy">选择分类后点击上传图片</Text>
          <Text className="kowtow-copy">
            带管理员审核通过后，会自动执行压缩流程
          </Text>
          <Text className="kowtow-copy">
            压缩完成后可以在选择的分类中查看图片
          </Text>
        </>
      ) : (
        <>
          <BoSheng />
          <Text className="kowtow-copy">
            全球博粉累计磕头{" "}
            {kowtowCount && kowtowStats.totalCount !== "-"
              ? (kowtowStats.totalCount as number) + kowtowCount
              : kowtowStats.totalCount}{" "}
            次
          </Text>
          <Text className="kowtow-copy">
            今日签到博粉 {kowtowStats.todayKowtowedUser}{" "}
            <Text className="utc">(utc+8)</Text>
          </Text>
          <View className="god-bo">
            <Canvas
              type="2d"
              id="god-bo-canvas"
              style={`top: ${canvasInfo.canvas.top};
                left: ${canvasInfo.canvas.left};
                height: ${canvasInfo.canvas.height}px;
                width: ${canvasInfo.canvas.width}px;`}
              className="canvas"
            />
            <SwiperImg
              changeSwiper={changeSwiper}
              images={swiperImages}
              accountIndex={canvasInfo.swiperIndex}
            />
          </View>
          <Text className="love">博爱世人</Text>
          {kowtowStats.totalCount !== "-" && (
            <Text className="kowtow-copy">
              {kowtowStats.iKowtowedToday
                ? "今日已磕，博哥对你很满意👍"
                : "今天你还没磕，抓紧"}
            </Text>
          )}
          {syncFailed && (
            <Text className="sync-warning" onClick={syncKowtowStats}>
              同步有点慢，点我重试
            </Text>
          )}
          <Button
            className={`submit-kowtow ${isKowtowing ? "loading" : ""}`}
            type="primary"
            onClick={handleKowtow}
          >
            {isKowtowing ? "磕着..." : "磕"}
          </Button>
        </>
      )}
    </View>
  );
}
