import { Swiper, SwiperItem, Image, View } from "@tarojs/components";
import { ReactNode } from "react";
import "./index.scss";

type SwiperImage = {
  img: string;
  ratio: string;
  canvas: {
    top: string;
    left: string;
    width: number;
    height: number;
  };
};

const SwiperImg = ({
  changeSwiper,
  images,
  accountIndex,
}: {
  changeSwiper: (e: number) => void;
  images: SwiperImage[];
  accountIndex: number;
}): ReactNode => {
  const handleChange = (e) => {
    changeSwiper(e);
  };
  return (
    <View className="swiper-console">
      <Swiper
        className="swiper-block"
        current={accountIndex}
        onChange={(e) => handleChange(e.detail.current)}
        vertical={false}
        circular
        autoplay
        full
        interval={5000}
      >
        {images &&
          images.map((img, index) => {
            return (
              <SwiperItem key={index} className="swiper-item">
                <Image
                  className="image"
                  src={img.img}
                  lazyLoad
                  mode="aspectFit"
                ></Image>
              </SwiperItem>
            );
          })}
      </Swiper>
    </View>
  );
};

export default SwiperImg;
