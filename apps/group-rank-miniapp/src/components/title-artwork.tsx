import ArtLettering from "./art-lettering";
import { useEffect, useState, type CSSProperties } from "react";
import { Image, Text, View } from "@tarojs/components";
import { currentGroupGeneration, groupApi } from "../lib/api";
import { createVisualMemory } from "../lib/visual-memory";
import "./title-artwork.scss";

type Artwork = { key: string; source: string; width: number; height: number };
const loadedTitles = createVisualMemory<Artwork>(8);

export const TITLE_ART_STYLE_VERSION = "electric-edge-v4";

export default function TitleArtwork({
  boardId,
  name,
  maxWidth,
  height,
}: {
  boardId: string;
  name: string;
  maxWidth?: number;
  height?: number;
}) {
  const generation = currentGroupGeneration();
  const [art, setArt] = useState<Artwork | null>(null);
  const key = `${generation}:${boardId}:${name}`;
  const visual = art?.key === key ? art : loadedTitles.get(generation, key);
  useEffect(() => {
    let active = true;
    if (!boardId || loadedTitles.get(generation, key)) return;
    void groupApi
      .titleArt(boardId)
      .then((result) => {
        if (
          active &&
          currentGroupGeneration() === generation &&
          result.name === name &&
          result.version === TITLE_ART_STYLE_VERSION &&
          result.imageDataUri?.startsWith("data:image/png;base64,") &&
          result.imageDataUri.length < 1024 * 1024 &&
          result.width > 0 &&
          result.width <= 2048 &&
          result.height > 0 &&
          result.height <= 2048
        )
          setArt({ key, source: result.imageDataUri, width: result.width, height: result.height });
      })
      .catch(() => {
        /* Preserve the actual board name when artwork is unavailable. */
      });
    return () => {
      active = false;
    };
  }, [boardId, name, generation, key]);
  const source = visual?.source || "";
  const fitted = visual?.source && maxWidth && height ? {
    width: Math.min(maxWidth, height * visual.width / visual.height),
    height: Math.min(height, maxWidth * visual.height / visual.width),
  } : null;
  const length = Array.from(name).length;
  return (
    <View
      className={`title-artwork ${length > 12 ? "title-artwork-long" : length > 6 ? "title-artwork-medium" : ""}`}
      style={source && fitted ? { "--title-flare-width": `${Math.min(maxWidth! * .95, fitted.width * 1.25)}px` } as CSSProperties : undefined}
    >
      <View className="title-flare" aria-hidden />
      <View className="title-spark" aria-hidden />
      {source ? <Text className="board-name title-artwork-alt">{name}</Text> : <ArtLettering className="board-name title-artwork-fallback" text={name} role="board" />}
      {source && (
        <Image
          className="title-artwork-image"
          src={source}
          mode="aspectFit"
          style={fitted ? {width: `${fitted.width}px`,height: `${fitted.height}px`} : undefined}
          onLoad={() => {
            if (visual && currentGroupGeneration() === generation) loadedTitles.set(generation, key, visual);
          }}
          onError={() => {
            loadedTitles.delete(generation, key);
            setArt({ key, source: "", width: 0, height: 0 });
          }}
        />
      )}
    </View>
  );
}
