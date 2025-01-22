import { useRef, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';

dayjs.extend(durationPlugin);

function completeToTargetDigits(number: number | string, digits = 2) {
  return String(number).padStart(digits, '0');
}

interface CountDown {
  'yyyyMMDD hhmmss': string;
  milliseconds: string;
}

export function getCountDown(tuixiu: dayjs.Dayjs): CountDown {
  const now = dayjs();

  const diff = tuixiu.diff(now);
  const duration = dayjs.duration(diff);
  const days = duration.asDays();
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();
  const milliseconds = duration.milliseconds();

  return {
    'yyyyMMDD hhmmss': `${Math.floor(days)} 天 ${completeToTargetDigits(hours)}:${completeToTargetDigits(minutes)}:${completeToTargetDigits(seconds)}`,
    milliseconds: completeToTargetDigits(milliseconds, 3),
  };
}

export function useTuixiuCountDown(tuixiu: dayjs.Dayjs) {
  const [countDown, setCountDown] = useState<CountDown>();
  const timer = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setCountDown(getCountDown(tuixiu));
    }, 16);

    return () => {
      clearInterval(timer.current!);
    };
  }, []);

  return countDown;
}
