import { Image } from "@tarojs/components";
import "./activity-icon.scss";

type IconName = "gamepad-2" | "dumbbell" | "footprints" | "trophy" | "pencil" | "users" | "chevron-right" | "message-circle" | "group-chat";

export function ProductIcon({name, inverse = false, notebook = false, className = ""}: {name: IconName; inverse?: boolean; notebook?: boolean; className?: string}) {
  return <Image className={`product-icon ${className}`} src={notebook ? `/assets/notebook/icon-${name}.png` : `/assets/premium/icon-${name}${inverse ? "-inverse" : ""}.png`} mode="aspectFit" />;
}

export default function ActivityIcon({template, inverse = false, notebook = false}: {template: {id?: string; name?: string; unit?: string; aggregate?: string}; inverse?: boolean; notebook?: boolean}) {
  const name: IconName = template.id === "game-score" ? "gamepad-2" : template.id === "pull-ups" ? "dumbbell" : template.id === "running-distance" ? "footprints" : "trophy";
  return <ProductIcon name={name} inverse={inverse} notebook={notebook} className="activity-icon" />;
}
