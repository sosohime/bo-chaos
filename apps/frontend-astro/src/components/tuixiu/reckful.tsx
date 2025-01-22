import React from 'react';
import { useTuixiuCountDown, getCountDown } from '../../hooks/countDown';
import { tuixiu } from '@mono/const';
import CopyToClipboardButton from '../copyToClipboard';
import { ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { buttonVariants } from '@mono/ui/button';

const { reckfulTuiXiuDay, reckfulChangQiFuWu } = tuixiu;

export default function Tuixiu() {
  const countDown = useTuixiuCountDown(reckfulTuiXiuDay);
  const changQiFuWuCountDown = useTuixiuCountDown(reckfulChangQiFuWu);

  const getTuiClipboardText = React.useCallback(() => {
    const tui = getCountDown(reckfulTuiXiuDay);
    return `你李进爷爷还有 ${tui['yyyyMMDD hhmmss']} 就退休了！`;
  }, []);

  return (
    <div className="text-center h-full w-full flex flex-col justify-center items-center">
      <h1 className="text-2xl pb-4">距离Reckful退休还有</h1>
      <p className="text-4xl pb-4">
        {countDown?.['yyyyMMDD hhmmss']}
        <span className="text-xl pl-1">{countDown?.milliseconds}</span>
      </p>

      <p className="pb-4">
        距离获得<span className="text-tencent-primary">长期服务假</span>
        还有&nbsp;&nbsp;{changQiFuWuCountDown?.['yyyyMMDD hhmmss']}
      </p>
      <div className="text-xs pb-4 scale-50">(UTC+8)</div>

      <div className="pb-4">
        <CopyToClipboardButton text={getTuiClipboardText} />
      </div>

      <div>
        <a
          className={buttonVariants({ variant: 'link' })}
          href="https://rocom.qq.com/"
          target="_blank"
          rel="noreferrer"
        >
          充值加速退休进度
          <ArrowUpRight />
        </a>
        <a className={buttonVariants({ variant: 'link' })} href="../bo">
          切换科兴双子
          <ArrowRightLeft />
        </a>
      </div>
    </div>
  );
}
