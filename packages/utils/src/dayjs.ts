import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import durationPlugin from "dayjs/plugin/duration";

// 导入类型声明
import type { Dayjs } from "dayjs";
import type { DurationUnitType } from "dayjs/plugin/duration";

// 扩展 dayjs 的类型定义
declare module "dayjs" {
  interface Dayjs {
    duration: typeof durationPlugin;
  }
}

dayjs.extend(timezone);
dayjs.extend(durationPlugin);
dayjs.tz.setDefault("Asia/Shanghai");

// Change to default export
export default dayjs;
export type { Dayjs, DurationUnitType };
