import {useEffect,useRef} from 'react';
import {previewEntryKind,previewNavigationQuery} from './entry';
const search=new URLSearchParams(location.search);
const device=search.get('device')||'ios';
const statusBarHeight=device==='android'?24:device==='none'?0:44;
const getWindowInfo=()=>({windowWidth:innerWidth,windowHeight:innerHeight,screenWidth:innerWidth,screenHeight:innerHeight,statusBarHeight});
const keyboardListeners=new Set<(event:{height:number})=>void>();
export const emitPreviewKeyboardHeight=(height:number)=>keyboardListeners.forEach(callback=>callback({height}));
const getMenuButtonBoundingClientRect=()=>{
 if(device==='none')return undefined;
 // Match the preview chrome's centered physical canvas (MAX_CANVAS_WIDTH=500).
 const right=(innerWidth+Math.min(innerWidth,500))/2;
 return {left:right-96,right:right-8,top:statusBarHeight+8,bottom:statusBarHeight+40,width:88,height:32};
};
export function useDidShow(callback:()=>void){const ref=useRef(callback);useEffect(()=>{ref.current()},[])}
export function usePageScroll(callback:({scrollTop}:{scrollTop:number})=>void){const ref=useRef(callback);ref.current=callback;useEffect(()=>{const handler=()=>ref.current({scrollTop:window.scrollY});window.addEventListener("scroll",handler,{passive:true});return()=>window.removeEventListener("scroll",handler)},[])}
export function useDidHide(_callback:()=>void){}
type PreviewShare = { title: string; path: string; imageUrl: string; promise?: Promise<PreviewShare> };
type ShareEvent = { from: "button"; target: { dataset: DOMStringMap } };
let currentShare: ((event: ShareEvent) => PreviewShare) | undefined;
export function useShareAppMessage(callback: (event: ShareEvent) => PreviewShare) {
 const latest = useRef(callback);
 latest.current = callback;
 useEffect(() => {
   const invoke = (event: ShareEvent) => latest.current(event);
   currentShare = invoke;
   return () => { if (currentShare === invoke) currentShare = undefined; };
 }, []);
}
export async function previewShare(event: React.MouseEvent<HTMLButtonElement>) {
 const initial = currentShare?.({ from: "button", target: { dataset: event.currentTarget.dataset } });
 const card = initial?.promise ? await initial.promise : initial;
 if (!card || document.querySelector('.preview-share')) return;
 const dialog = document.createElement('dialog');
 dialog.className = 'preview-share';
 dialog.dataset.path = card.path;
 dialog.setAttribute('aria-label', '浏览器卡片预览');
 const heading = document.createElement('p');
 heading.textContent = '浏览器卡片预览';
 const title = document.createElement('strong');
 title.textContent = card.title;
 const cover = document.createElement('img');
 cover.src = card.imageUrl;
 cover.alt = '博哥的小本儿分享封面';
 const close = document.createElement('button');
 close.textContent = '关闭预览';
 close.onclick = () => dialog.close();
 dialog.append(heading, title, cover, close);
 dialog.addEventListener('close', () => dialog.remove(), { once: true });
 document.body.append(dialog);
 dialog.showModal();
}
export function useRouter(){return {params:{...Object.fromEntries(search),id:search.get('id')||'board-volt'}}}
function navigate({url}:{url:string}){location.href='?'+previewNavigationQuery(new URLSearchParams(location.search),url).toString();return Promise.resolve()}
const previewStorage=new Map<string,unknown>();
function createSelectorQuery(){
 const selectors:string[]=[];
 const query={select:(selector:string)=>{selectors.push(selector);return query},boundingClientRect:()=>query,exec:(callback:(rects:any[])=>void)=>{callback(selectors.map(selector=>document.querySelector(selector)?.getBoundingClientRect().toJSON()||null))}};
 return query;
}
const taro={createSelectorQuery,getWindowInfo,getMenuButtonBoundingClientRect,setNavigationBarTitle:()=>{},getEnterOptionsSync:()=>({scene:previewEntryKind(search)==='lobby'?1001:1158}),navigateTo:navigate,reLaunch:navigate,redirectTo:navigate,navigateBack:()=>navigate({url:'/index/'}),canIUse:()=>false,pageScrollTo:async({scrollTop=0,selector,offsetTop=0}:any)=>window.scrollTo({top:selector ? window.scrollY+(document.querySelector(selector)?.getBoundingClientRect().top||0)+offsetTop : scrollTop}),nextTick:(fn:()=>void)=>requestAnimationFrame(fn),showToast:({title}:{title:string})=>{const n=document.createElement('div');n.className='preview-toast';n.textContent=title;document.body.append(n);setTimeout(()=>n.remove(),2000)},showModal:async({title,content}:any)=>({confirm:confirm(title+'\n'+content),cancel:false}),showActionSheet:async({itemList}:any)=>({tapIndex:Number(prompt(itemList.map((s:string,i:number)=>`${i}: ${s}`).join('\n'),'0'))}),getStorageSync:(key:string)=>previewStorage.get(key),setStorageSync:(key:string,value:unknown)=>{previewStorage.set(key,value)},removeStorageSync:(key:string)=>{previewStorage.delete(key)},showShareMenu:()=>Promise.resolve()};
Object.assign(taro,{onKeyboardHeightChange:(callback:(event:{height:number})=>void)=>keyboardListeners.add(callback),offKeyboardHeightChange:(callback:(event:{height:number})=>void)=>keyboardListeners.delete(callback)});
Object.assign(taro,{hideKeyboard:async()=>{(document.activeElement as HTMLElement|null)?.blur?.();emitPreviewKeyboardHeight(0);return {errMsg:'hideKeyboard:ok'}}});
export default taro;

Object.assign(taro,{
 chooseMedia:()=>new Promise((resolve,reject)=>{const input=document.createElement('input');input.type='file';input.accept='image/jpeg,image/png,image/webp';input.onchange=()=>{const file=input.files?.[0];if(!file){reject({errMsg:'cancel'});return;}resolve({tempFiles:[{tempFilePath:URL.createObjectURL(file),size:file.size}]});};input.oncancel=()=>reject({errMsg:'cancel'});input.click();}),
 getImageInfo:({src}:{src:string})=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve({width:image.naturalWidth,height:image.naturalHeight});image.onerror=reject;image.src=src;}),
 getFileInfo: async ({ filePath }: { filePath: string }) => ({ size: (await (await fetch(filePath)).blob()).size }),
 async compressImage({ src, quality, compressedWidth, compressedHeight }: { src: string; quality: number; compressedWidth?: number; compressedHeight?: number }) {
  const image = new Image();
  image.src = src;
  await image.decode();
  const scale = compressedWidth ? compressedWidth / image.naturalWidth : compressedHeight! / image.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob
    ? resolve({ tempFilePath: URL.createObjectURL(blob) })
    : reject(new Error("Cannot compress the local preview image")), "image/jpeg", quality / 100));
 },
});

Object.assign(taro,{getCurrentInstance:()=>({page:{}}),createIntersectionObserver:()=>{let margins:any={},observer:IntersectionObserver;const api={relativeToViewport:(next:any)=>{margins=next;return api;},observe:(selector:string,callback:any)=>{observer=new IntersectionObserver(entries=>entries.forEach(entry=>callback({intersectionRatio:entry.intersectionRatio})),{rootMargin:`${margins.top||0}px ${margins.right||0}px ${margins.bottom||0}px ${margins.left||0}px`});const element=document.querySelector(selector);if(element)observer.observe(element);},disconnect:()=>observer?.disconnect()};return api;}});

const resizeListeners = new Set<(event: {size: ReturnType<typeof getWindowInfo>}) => void>();
const windowResized = () => resizeListeners.forEach(callback => callback({size:getWindowInfo()}));
Object.assign(taro, {
 onWindowResize: (callback:any) => {if (!resizeListeners.size) window.addEventListener('resize', windowResized);resizeListeners.add(callback);},
 offWindowResize: (callback:any) => {resizeListeners.delete(callback);if (!resizeListeners.size) window.removeEventListener('resize', windowResized);},
});

Object.assign(taro, {
 createOffscreenCanvas: ({width,height}: {width:number;height:number}) => {
  const canvas = document.createElement('canvas'); canvas.width=width; canvas.height=height; return canvas;
 },
 canvasToTempFilePath: async ({canvas}: {canvas:HTMLCanvasElement}) => ({tempFilePath:canvas.toDataURL()}),
});
