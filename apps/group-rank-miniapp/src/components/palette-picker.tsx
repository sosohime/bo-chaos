import { useEffect, useState } from "react";
import { Button, Slider, Text, View } from "@tarojs/components";
import type { GroupRankThemeId } from "@mono/types";
import { colorToHsl, hslColor, paletteColors, paletteStyle, themeColor, validColor } from "../lib/palette";
import { useSheetLayout } from "./bottom-sheet";
import "./palette-picker.scss";

export default function PalettePicker({ value, theme, disabled = false, collapsible = false, compact = false, onChange }: {
  compact?: boolean; collapsible?: boolean; value?: string | null; theme: GroupRankThemeId; disabled?: boolean; onChange: (color: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(!collapsible);
  const measure = useSheetLayout();
  const selected = validColor(value), color = selected || themeColor(theme);
  const [custom, setCustom] = useState(!!selected && !paletteColors.some(p => p.value === selected));
  useEffect(measure, [custom, expanded, measure]);
  const hsl = colorToHsl(color);
  const [hue, setHue] = useState(hsl.hue);
  const [light, setLight] = useState(hsl.light);
  const change = (color: string | null) => { if (!disabled) onChange(color); };
  const choose = (color: string | null) => { const next = colorToHsl(color || themeColor(theme)); setHue(next.hue); setLight(next.light); change(color); };
  return <View className="palette-picker">
    {compact ? <View className="palette-quick-row"><Button className="palette-quick-label" disabled={disabled} onClick={() => setExpanded(!expanded)}>配色<View className="palette-quick-chevron" /></Button><View className="palette-quick-options">{[null,"#BAFF00","#FF8000","#398AFF"].map(raw => <Button key={raw || "default"} ariaLabel={raw ? `${paletteColors.find(p => p.value === raw)?.name || raw}配色` : "跟随背景主题配色"} disabled={disabled} onClick={() => choose(raw)} className={`palette-quick ${selected === raw ? "palette-quick-selected" : ""}`}><View style={{backgroundColor:raw || themeColor(theme)}}>{!raw && <Text>↺</Text>}</View></Button>)}</View></View> : collapsible ? <Button className="palette-heading palette-heading-toggle" disabled={disabled} onClick={() => setExpanded(!expanded)}><Text>榜单配色</Text><View><View className="palette-current-dot" style={{backgroundColor:color}} /><Text>{selected ? paletteColors.find(p => p.value === selected)?.name || "自选颜色" : "默认"}</Text><Text>{expanded ? "⌄" : "›"}</Text></View></Button> : <View className="palette-heading"><Text>榜单配色</Text><Text>{selected || "跟随背景主题"}</Text></View>}
    {expanded && <>
    <View className="palette-options">
      <Button className={`palette-option ${!selected ? "palette-selected" : ""}`} disabled={disabled} ariaLabel="跟随背景主题配色" onClick={() => choose(null)}>
        <View className="palette-dot palette-default" /><Text>默认</Text>
      </Button>
      {paletteColors.map(p => <Button key={p.value} ariaLabel={`${p.name}配色`} disabled={disabled}
        className={`palette-option ${selected === p.value ? "palette-selected" : ""}`} onClick={() => choose(p.value)}>
        <View className="palette-dot" style={{ backgroundColor: p.value }}>{selected === p.value && <Text style={{ color: paletteStyle(p.value)["--accent-ink" as keyof ReturnType<typeof paletteStyle>] as string }}>✓</Text>}</View><Text>{p.name}</Text>
      </Button>)}
    </View>
    <Button className="text-action palette-custom-toggle" disabled={disabled} onClick={() => { setHue(hsl.hue); setLight(hsl.light); setCustom(!custom); }}><Text>自选颜色</Text><Text>{custom ? "收起 −" : "+"}</Text></Button>
    {custom && <View className="palette-custom">
      <Text className="palette-slider-label">色相</Text>
      <View className="palette-hue"><Slider min={0} max={359} value={hue} disabled={disabled} activeColor={color} backgroundColor="transparent"
        onChanging={e => { setHue(e.detail.value); change(hslColor(e.detail.value, light)); }}
        onChange={e => { setHue(e.detail.value); change(hslColor(e.detail.value, light)); }} /></View>
      <Text className="palette-slider-label">明暗</Text>
      <Slider min={10} max={90} value={light} disabled={disabled} activeColor={color}
        onChanging={e => { setLight(e.detail.value); change(hslColor(hue, e.detail.value)); }}
        onChange={e => { setLight(e.detail.value); change(hslColor(hue, e.detail.value)); }} />
    </View>}
    </>}
  </View>;
}
