import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import durationPlugin from "dayjs/plugin/duration";

dayjs.extend(timezone);
dayjs.extend(durationPlugin);
dayjs.tz.setDefault("Asia/Shanghai");

export { dayjs };
