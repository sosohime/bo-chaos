/// <reference types="@tarojs/taro" />
declare module "*.scss";
declare const GROUP_RANK_API_BASE_URL: string;
declare namespace JSX {
  interface IntrinsicElements {
    "notebook-corner": {
      label: string;
      backlabel: string;
      backready: boolean;
      turnpulse: number;
      leafkey: string;
      ready: boolean;
      children?: import("react").ReactNode;
      disabled: boolean;
      onTurn: (event: { detail: { direction: number } }) => void;
    };
  }
}
