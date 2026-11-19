// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
const host = vi.hoisted(() => ({ width:390, height:844, callbacks:new Set<() => void>() }));
vi.mock("@tarojs/taro", () => ({default:{
  getWindowInfo:()=>({windowWidth:host.width,windowHeight:host.height,statusBarHeight:44}),
  getMenuButtonBoundingClientRect:()=>({left:host.width-96,top:52,bottom:84,height:32}),
  onWindowResize:(cb:()=>void)=>host.callbacks.add(cb),
  offWindowResize:(cb:()=>void)=>host.callbacks.delete(cb),
}}));
import { useViewport, viewportStyle, readViewport } from "./viewport";
it("updates all mounted geometry owners together on in-place resize and cleans the host listener",()=>{
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
  const container=document.createElement("div"), root=createRoot(container);
  function Owner(){const viewport=useViewport();return createElement("div",{style:viewportStyle(viewport),"data-canvas":viewport.canvas,"data-scale":viewport.scale});}
  act(()=>root.render(createElement("section",null,createElement(Owner),createElement(Owner))));
  expect(host.callbacks.size).toBe(1);
  for(const width of [675,320,500,390]){
    host.width=width;
    act(()=>host.callbacks.forEach(cb=>cb()));
    for(const element of container.querySelectorAll<HTMLElement>("[data-canvas]")){
      const canvas=Math.min(width,500);
      expect(element.dataset.canvas).toBe(String(canvas));
      expect(element.style.getPropertyValue("--ui-unit")).toBe(`${canvas/375}px`);
      expect(element.style.getPropertyValue("--frame-left")).toBe(`${(width-canvas)/2}px`);
    }
  }
  act(()=>root.unmount());expect(host.callbacks.size).toBe(0);
  vi.unstubAllGlobals();
});
it("reserves capsule overlap relative to the canvas rather than full host width",()=>{
  host.width=675;expect(readViewport()).toMatchObject({canvas:500,left:87.5,clearance:16.5,header:48});
  host.width=390;expect(readViewport()).toMatchObject({clearance:104});
});

it("centers the title band on the actual capsule instead of imposing a taller header",()=>{
  host.width=390;
  const frame=readViewport();
  expect(frame.status+frame.header/2).toBe((52+84)/2);
});
