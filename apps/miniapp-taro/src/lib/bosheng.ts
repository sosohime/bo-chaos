import { dayjs } from "@mono/utils";
import { birthday } from "@mono/const";

const boBirthday = birthday.boBirthday;

export function isBoSheng() {
  return boBirthday.format("MM-DD") === dayjs().format("MM-DD");
}
