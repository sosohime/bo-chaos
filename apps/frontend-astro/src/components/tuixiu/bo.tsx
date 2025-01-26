import React from 'react';
import { useTuixiuCountDown, getCountDown } from '../../hooks/countDown';
import type { CountDown } from '../../hooks/countDown';
import { tuixiu } from '@mono/const';
import CopyToClipboardButton from '../copyToClipboard';
import { ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { buttonVariants } from '@mono/ui/button';

const { boTuiXiuDay } = tuixiu;

export default function Tuixiu({
  initCountDown,
}: {
  initCountDown: CountDown;
}) {
  const countDown = useTuixiuCountDown(boTuiXiuDay);

  const getTuiClipboardText = React.useCallback(() => {
    const botui = getCountDown(boTuiXiuDay || initCountDown);
    return `普大喜奔，距离博哥退休还有${botui['yyyyMMDD hhmmss']}，转发到五个群再看你的头像，是真的！`;
  }, []);

  return (
    <div className="text-center h-full w-full flex flex-col justify-center items-center">
      <h1 className="text-2xl pb-4">距离博哥退休还有</h1>
      <p className="text-4xl pb-4">
        {(countDown || initCountDown)['yyyyMMDD hhmmss']}
        <span className="text-xl pl-1">
          {(countDown || initCountDown)['milliseconds']}
        </span>
      </p>
      <div className="text-xs pb-4 scale-50">(UTC+8)</div>

      <div className="pb-4">
        <CopyToClipboardButton text={getTuiClipboardText} />
      </div>

      <div>
        <a
          className={buttonVariants({ variant: 'link' })}
          href="https://yuanbo.online/dagezi"
          target="_blank"
          rel="noreferrer"
        >
          合成大鸽子
          <ArrowUpRight />
        </a>
        <a
          className={buttonVariants({ variant: 'link' })}
          href="https://mp.weixin.qq.com/s/UnSRkdPLQA5kovVUhzUtwQ"
          target="_blank"
          rel="noreferrer"
        >
          用锐驰变 rich 🥰
          <ArrowUpRight />
        </a>
        <a className={buttonVariants({ variant: 'link' })} href="../reckful">
          切换科兴双子
          <ArrowRightLeft />
        </a>
      </div>
    </div>
  );
}
