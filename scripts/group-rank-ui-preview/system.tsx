import React, {useEffect,useState} from 'react';
import type {GroupRankBoardDetail,GroupRankBoardDto} from '@mono/types';
import {groupApi} from './api';
import BoardRanking from '../../apps/group-rank-miniapp/src/components/board-ranking';
import BrandMark from '../../apps/group-rank-miniapp/src/components/brand-mark';
import BookCard from '../../apps/group-rank-miniapp/src/components/book-card';
import ArtLettering from '../../apps/group-rank-miniapp/src/components/art-lettering';
import {materialForTheme} from '../../apps/group-rank-miniapp/src/components/arena-background';
import BoardPreview from '../../apps/group-rank-miniapp/src/components/board-preview';
import {useViewport,viewportStyle} from '../../apps/group-rank-miniapp/src/lib/viewport';
import '../../apps/group-rank-miniapp/src/pages/board/notebook.scss';
import './system.css';

/** Design workspace only. Every sample renders the real production component. */
export default function ComponentSystem(){
 const viewport=useViewport();
 const [detail,setDetail]=useState<GroupRankBoardDetail|null>(null);
 const [boards,setBoards]=useState<GroupRankBoardDto[]>([]);
 const [count,setCount]=useState(3);

 useEffect(()=>{void Promise.all([groupApi.board('preview-board'),groupApi.currentGroup()]).then(([board,group])=>{setDetail(board);setBoards(group.boards)});},[]);
 return <div className="system-workspace" style={viewportStyle(viewport)}>
  <header><div><small>工作主稿 · 合成内容 · 不在小程序包内</small><h1>博哥的小本儿 / 组件</h1><p>同一份组件源码、字体和完整素材。确认稿保持不变。</p></div><nav><a href="/gallery.html">整页组合</a><a href="/responsive.html">尺寸与状态</a></nav></header>
  <section className="system-spec"><h2>01 / 字体角色</h2><div className="system-type-grid theme--volt">
   <div><small>艺术榜名 · 可编辑字形</small><ArtLettering text="尿酸王" role="board"/><p>真实书写轮廓；失败仍显示真实榜名。</p></div>
   <div><small>玩法标题</small><ArtLettering text="跑步里程" plain/><p>系统正文，保留文字语义。</p></div>
   <div><small>成绩</small><strong className="system-score">668</strong><p>衬线数字，长数值完整显示。</p></div>
   <div><small>姓名 / 单位 / 辅助</small><b>山间来信</b><p>μmol/L · 待认领</p></div>
  </div></section>
  <section className="system-spec"><h2>02 / 材质与槽位</h2><div className="system-material-grid">{(['volt','coral','midnight'] as const).map(theme=><figure key={theme}><img src={materialForTheme(theme)}/><img src={materialForTheme(theme,'card')}/><figcaption>{theme} / 头图与卡片各用独立整图</figcaption></figure>)}</div><div className="system-ribbon theme--volt"><BrandMark cover/></div></section>
  <section className="system-spec"><h2>03 / 三主题承载母版</h2><div className="system-family-grid">{detail&&(['volt','coral','midnight'] as const).map(theme=>{const board=boards.find(item=>item.themeId===theme);if(!board)return null;return <div className={`system-family theme--${theme}`} key={theme}><h3>{theme} / 同一500px画布</h3><BookCard board={board} onOpen={()=>location.assign(`/?screen=board&id=${board.id}&case=fidelity`)}/><h3>榜名与冠军</h3><div className="system-ranks collection-paper"><BoardRanking detail={{...detail,...board,themeId:theme,ranking:(board.summary?.leaders||detail.ranking).slice(0,1)}} width={viewport.canvas} busy={false} interaction={()=>({label:''})} onRules={()=>{}}/></div><h3>创建预览</h3><BoardPreview name={board.template.name} unit={board.template.unit} theme={theme}/></div>})}</div></section>
  <section className="system-spec"><h2>04 / 不同人数的榜单页</h2><div className="system-controls"><label>人数<select value={count} onChange={e=>setCount(Number(e.target.value))}>{[0,1,2,3].map(n=><option key={n}>{n}</option>)}</select></label></div><div className="system-ranks system-motion collection-paper theme--volt">{detail&&<BoardRanking detail={{...detail,ranking:detail.ranking.slice(0,count)}} width={viewport.canvas} busy={false} interaction={()=>({label:''})} onRules={()=>{}}/>}</div></section>
  <footer>组件 → 整页 → 适配。测试和无溢出不替代视觉判断；源码与模拟器证据不替代真机验收。</footer>
 </div>;
}
