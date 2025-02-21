import { Text, View } from "@tarojs/components";
import { useState } from "react";
import { dayjs } from "@mono/utils";
import { birthday } from "@mono/const";
import "./index.scss";

const boBirthday = birthday.boBirthday;

export default function BoSheng({
  boxStyle,
}: {
  boxStyle?: React.CSSProperties;
}) {
  const [isBirthday] = useState(
    boBirthday.format("MM-DD") === dayjs().format("MM-DD"),
  );

  const content = (
    <View className="birthday-container">
      <Text className="bosheng">
        博生日五群！博生日五群！！博生日五群！！！
      </Text>
      <Text className="bosheng">
        博生日五群！博生日五群！！博生日五群！！！
      </Text>
    </View>
  );

  return isBirthday ? (
    boxStyle ? (
      <View style={boxStyle}>{content}</View>
    ) : (
      content
    )
  ) : (
    <></>
  );
}
