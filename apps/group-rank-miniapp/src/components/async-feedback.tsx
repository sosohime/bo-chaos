import { Button, Text, View, type ButtonProps } from "@tarojs/components";
import "./async-feedback.scss";

/** One visible pending treatment for native buttons and their browser preview. */
export function ActionButton({
  loading = false,
  pendingLabel = "保存中…",
  disabled,
  className = "action",
  children,
  ...props
}: ButtonProps & { pendingLabel?: string }) {
  return (
    <Button
      {...props}
      className={`${className} ${loading ? "action-pending" : ""}`}
      disabled={disabled || loading}
      hoverClass="arena-control-pressed"
      hoverStartTime={0}
      hoverStayTime={80}
    >
      {loading ? <><View className="async-spinner" aria-hidden /><Text>{pendingLabel}</Text></> : children}
    </Button>
  );
}

export function LoadStatus({ label, compact = false }: { label: string; compact?: boolean }) {
  return <View className={`load-status ${compact ? "load-status-compact" : ""}`}>
    <View className="async-spinner" aria-hidden /><Text>{label}</Text>
  </View>;
}

/** Reserve the same major regions as the incoming data; skeletons never contain invented values. */
export function PageSkeleton({ variant = "catalog" }: { variant?: "catalog" | "board" }) {
  return <View className={`page-skeleton page-skeleton-${variant}`}>
    <LoadStatus label={variant === "board" ? "正在加载榜单" : "正在加载榜单列表"} />
    {variant === "board" && (
      <View className="skeleton-cover" aria-hidden>
        <View className="skeleton-fill skeleton-title" />
      </View>
    )}
    <View className="skeleton-rows" aria-hidden>{[0, 1, 2].map(i => <View className="skeleton-row" key={i}>
      <View className="skeleton-fill skeleton-thumbnail" /><View className="skeleton-copy"><View className="skeleton-fill skeleton-name" /><View className="skeleton-fill skeleton-meta" /></View>
    </View>)}</View>
  </View>;
}
