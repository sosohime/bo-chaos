import React, { useState } from 'react';
import { useTuixiuCountDown, getCountDown } from '../hooks/countDown';
import { tuixiu } from '@mono/const';
const { boTuiXiuDay } = tuixiu;

export default function Tuixiu() {
  const countDown = useTuixiuCountDown(boTuiXiuDay);

  React.useEffect(() => {
    document.title = '博之退休倒计时';
  }, []);

  const getTuiClipboardText = React.useCallback(() => {
    return `普大喜奔，距离博哥退休还有${getCountDown(boTuiXiuDay)}，转发到五个群再看你的头像，是真的！`;
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <h1>距离博哥退休还有</h1>
      <p style={{ fontSize: '2rem' }}>{countDown}</p>
      <div style={{ fontSize: '0.5rem', marginBottom: '2rem' }}>(UTC+8)</div>
    </div>
  );
}
