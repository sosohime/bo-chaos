import {paletteStyle} from '../lib/palette';
import {Text,View} from '@tarojs/components';
import type {GroupRankBackground,GroupRankThemeId} from '@mono/types';
import ArenaBackground from './arena-background';
import ArtLettering from './art-lettering';
import './board-preview.scss';

/** The editable creation preview and the design master use this same surface. */
export default function BoardPreview({name,unit,theme,background,source,accentColor}:{
 name:string;unit:string;theme:GroupRankThemeId;
 accentColor?:string|null;
 background?:GroupRankBackground|null;source?:string;
}){
 const length=Array.from(name).length;
 return <View className={`create-live-preview theme--${theme}`} style={paletteStyle(accentColor)}>
  <ArenaBackground theme={theme} background={background} source={source} layoutKey={name} presetLayout="preview"/>
  <Text className="create-preview-label">预览</Text>
  <ArtLettering text={name||'你的榜单名'} className={`create-preview-name ${length>12?'create-preview-long':length>6?'create-preview-medium':''}`}/>
  <Text className="create-preview-note">— {unit}</Text>
 </View>;
}
