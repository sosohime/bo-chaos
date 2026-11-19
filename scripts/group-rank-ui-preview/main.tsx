import '../../apps/group-rank-miniapp/src/app.scss';
import React from 'react';
import {createRoot} from 'react-dom/client';
import Home from '../../apps/group-rank-miniapp/src/pages/index/index';
import Board from '../../apps/group-rank-miniapp/src/pages/board/index';
import Create from '../../apps/group-rank-miniapp/src/pages/create/index';
import ComponentSystem from './system';
import './preview.css';
const screen=new URLSearchParams(location.search).get('screen')||'board';
const device=new URLSearchParams(location.search).get('device')||'ios';
// A viewport-only comparison export excludes editor chrome, never product UI.
document.documentElement.classList.toggle('preview-comparison',new URLSearchParams(location.search).get('comparison')==='true');
document.documentElement.style.setProperty('--preview-safe-bottom',device==='ios'?'34px':'0px');
createRoot(document.getElementById('root')!).render(<>
  {device!=='none'&&<div className={`preview-chrome preview-chrome-${device}`} aria-hidden="true"><span>9:41</span><span className="preview-capsule">•••　│　◉</span></div>}
  {screen==='system'?<ComponentSystem/>:screen==='board'?<Board/>:screen==='create'?<Create/>:<Home/>}
</>);
