import React, {useEffect,useLayoutEffect,useState,useRef} from 'react';
import {createPortal} from 'react-dom';
import {emitPreviewKeyboardHeight,previewShare} from './taro';
export const View=({children,catchMove,onTouchStart,onTouchMove,onTouchEnd,...props}:any)=>(React.createElement("view",{...props,onTouchStart,onTouchMove:(e:any)=>{if(catchMove){e.preventDefault();e.stopPropagation();}onTouchMove?.(e);},onTouchEnd,...(onTouchStart?{onMouseDown:(e:any)=>onTouchStart({touches:[{clientX:e.clientX,clientY:e.clientY}]}),onMouseMove:(e:any)=>{if(e.buttons===1)onTouchMove?.({touches:[{clientX:e.clientX,clientY:e.clientY}]});},onMouseUp:(e:any)=>onTouchEnd?.({touches:[],changedTouches:[{clientX:e.clientX,clientY:e.clientY}]})}:{})},children));
export const RootPortal=({children}:any)=>createPortal(children,document.body);
export const PageMeta=({pageStyle,scrollTop}:any)=>{useLayoutEffect(()=>{const body=document.body.style.cssText;const html=document.documentElement.style.overflow;if(pageStyle){document.body.style.cssText+=';'+pageStyle;document.documentElement.style.overflow="hidden";}if(scrollTop&&!pageStyle)window.scrollTo(0,parseFloat(scrollTop));return()=>{document.body.style.cssText=body;document.documentElement.style.overflow=html}},[pageStyle,scrollTop]);return null};
export const Text=({children,...props}:any)=>(React.createElement("text",props,children));
export const Button=({children,onClick,openType,formType,loading,disabled,hoverClass,hoverStartTime,hoverStayTime,ariaLabel,...props}:any)=><button {...props} aria-label={ariaLabel} type={formType==='submit'?'submit':'button'} disabled={disabled} onMouseDown={e=>{if(document.activeElement?.getAttribute('data-hold-keyboard')==='true')e.preventDefault();}} onClick={openType === "share" ? previewShare : onClick}>{children}</button>;
const PreviewTextField=({multiline,onInput,onNickNameReview,onBlur,onFocus,onKeyboardHeightChange,adjustPosition,holdKeyboard,cursorSpacing,type,maxlength,confirmType,focus,placeholderClass,fixed,disableDefaultPadding,ariaLabel,...props}:any)=>{
 const [keyboard,setKeyboard]=useState(false);
 const ref=useRef<HTMLInputElement & HTMLTextAreaElement>(null);
 const height=Number(new URLSearchParams(location.search).get('keyboard')||0);
 // Mirror ordinary native field auto-pan. Portal fields opt out and own
 // its ScrollView focus anchor; this adapter never pans those fields.
 useLayoutEffect(()=>{if(!keyboard||height<=0||adjustPosition===false||!ref.current)return;const bottom=innerHeight-height-Math.max(0,Number(cursorSpacing)||0);const delta=ref.current.getBoundingClientRect().bottom-bottom;if(delta>0)window.scrollTo({top:window.scrollY+delta,behavior:'instant' as ScrollBehavior});},[keyboard,height,adjustPosition,cursorSpacing]);
 const Field=multiline?'textarea':'input';
 return <><Field {...props} ref={ref} aria-label={ariaLabel} data-hold-keyboard={holdKeyboard?'true':undefined} type={multiline?undefined:type==='digit'||type==='nickname'?'text':type||'text'} maxLength={maxlength}
   onFocus={e=>{setKeyboard(true);emitPreviewKeyboardHeight(height);onFocus?.({detail:{height,value:e.target.value}});}}
   onBlur={e=>{setKeyboard(false);emitPreviewKeyboardHeight(0);onKeyboardHeightChange?.({detail:{height:0}});onBlur?.(e);}}
   onChange={e=>onInput?.({detail:{value:e.target.value}})} />
   {keyboard&&height>0&&<div className="preview-keyboard" style={{height}}><span>模拟键盘 · {height}px</span><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>{ref.current?.blur();setKeyboard(false);onKeyboardHeightChange?.({detail:{height:0}});}}>完成</button></div>}
 </>;
};
export const Input=(props:any)=><PreviewTextField {...props}/>;
export const Textarea=(props:any)=><PreviewTextField {...props} multiline/>;
export const Image=({mode,src,...props}:any)=><img {...props} src={src} style={{...props.style,objectFit:mode==='aspectFit'?'contain':mode==='aspectFill'?'cover':'fill'}}/>;
export const Form=({onSubmit,children,...props}:any)=><form {...props} onSubmit={e=>{e.preventDefault();onSubmit?.({detail:{value:Object.fromEntries(new FormData(e.currentTarget).entries())}})}}>{children}</form>;
export const Picker=({children,range,value,onChange,disabled}:any)=><div className="preview-picker">{children}<select disabled={disabled} value={value} onChange={e=>onChange?.({detail:{value:e.target.value}})}>{range?.map((s:string,i:number)=><option key={i} value={i}>{s}</option>)}</select></div>;
export const ScrollView=({scrollY,scrollTop,scrollIntoView,scrollWithAnimation,onScroll,children,...props}:any)=>{
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{if(scrollIntoView&&ref.current){const field=ref.current.querySelector('#'+scrollIntoView) as HTMLElement|null;if(field)ref.current.scrollTop=field.offsetTop-ref.current.offsetTop;}},[scrollIntoView]);
 useEffect(()=>{if(ref.current&&typeof scrollTop==='number')ref.current.scrollTop=scrollTop;},[scrollTop]);
 return React.createElement('view',{...props,ref,onScroll:(e:any)=>onScroll?.({detail:{scrollTop:e.currentTarget.scrollTop}})},children);
};
// Browser cannot access WeChat's private open-data renderer.
export const OpenData=({defaultText='本群',className}:any)=><span className={className}>{defaultText}</span>;

export const Slider=({min,max,value,disabled,activeColor,onChange,onChanging}:any)=><input className="preview-slider" style={{accentColor:activeColor}} type="range" min={min} max={max} value={value} disabled={disabled} onChange={e=>{onChanging?.({detail:{value:Number(e.target.value)}});onChange?.({detail:{value:Number(e.target.value)}})}}/>;
