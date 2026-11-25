import { useEffect, useState } from "react";
import { Image, Text, View } from "@tarojs/components";
import { currentGroupGeneration, groupApi } from "../lib/api";
import { createVisualMemory } from "../lib/visual-memory";

const loadedAvatars = createVisualMemory<string>(120);

export default function Avatar({ userId, version, name }: {
  userId: string;
  version?: string | null;
  name: string;
}) {
  const generation = currentGroupGeneration();
  const key = `${userId}:${version || ""}`;
  const cached = version ? loadedAvatars.get(generation, key) : undefined;
  const [image, setImage] = useState<{ key: string; source: string; loading: boolean } | null>(null);
  const identity = `${generation}:${key}`;
  const state = image?.key === identity ? image : null;
  const source = state?.source ?? cached;
  const loading = state?.loading ?? (!!version && !cached);

  useEffect(() => {
    let active = true;
    if (version && !loadedAvatars.get(generation, key)) {
      void groupApi.avatar(userId, version).then(path => {
        if (active && currentGroupGeneration() === generation)
          setImage({ key: identity, source: path, loading: true });
      }).catch(() => {
        if (active) setImage({ key: identity, source: "", loading: false });
      });
    }
    return () => { active = false; };
  }, [identity, generation, key, userId, version]);

  return <View className={`person-avatar ${source ? "" : "person-avatar-placeholder"}`}>
    {source ? <Image
      className="person-avatar-image"
      src={source}
      mode="aspectFill"
      onLoad={() => {
        if (currentGroupGeneration() === generation) loadedAvatars.set(generation, key, source);
        setImage({ key: identity, source, loading: false });
      }}
      onError={() => {
        loadedAvatars.delete(generation, key);
        setImage({ key: identity, source: "", loading: false });
      }}
    /> : <Text>{loading ? "" : Array.from(name.trim())[0] || "友"}</Text>}
    {loading && <View className="asset-loading" aria-hidden />}
  </View>;
}
