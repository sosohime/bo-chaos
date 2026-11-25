import {
  createContext,
  useContext,
  useCallback,
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Form, Input, RootPortal, ScrollView, Textarea, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import {
  sheetViewportHeight,
  keyboardSheetLayout,
} from "../lib/sheet-viewport";
import { paletteStyle } from "../lib/palette";
import { FrameAccent, FrameTheme } from "./page-frame";
import { useViewport, viewportStyle } from "../lib/viewport";

const KeyboardContext = createContext<
  (height?: number, fieldId?: string) => void
>(() => {});
let fieldSequence = 0;
const SheetMeasureContext = createContext<() => void>(() => {});
export const useSheetLayout = () => useContext(SheetMeasureContext);

function useSheetKeyboardField() {
  const updateKeyboard = useContext(KeyboardContext);
  const [id] = useState(() => `sheet-field-${++fieldSequence}`);
  return { id, reportHeight: (height?: number) => updateKeyboard(height, id) };
}

/** Sheet inputs leave all keyboard movement to their shared viewport owner. */
export function SheetInput({
  onFocus,
  onKeyboardHeightChange,
  ...props
}: ComponentProps<typeof Input>) {
  const { id, reportHeight } = useSheetKeyboardField();
  return (
    <View className="sheet-input" id={id}>
      <Input
        {...props}
        className={`sheet-native-input ${props.className || ""}`}
        adjustPosition={false}
        holdKeyboard
        cursorSpacing={16}
        confirmType="done"
        onFocus={(event) => {
          reportHeight(event.detail.height > 0 ? event.detail.height : undefined);
          onFocus?.(event);
        }}
        onKeyboardHeightChange={(event) => {
          reportHeight(event.detail.height);
          onKeyboardHeightChange?.(event);
        }}
      />
    </View>
  );
}

export function SheetTextarea({
  onFocus,
  onKeyboardHeightChange,
  ...props
}: ComponentProps<typeof Textarea>) {
  const { id, reportHeight } = useSheetKeyboardField();
  return (
    <View id={id}>
      <Textarea
        {...props}
        adjustPosition={false}
        holdKeyboard
        fixed
        cursorSpacing={16}
        disableDefaultPadding
        onFocus={event => {
          reportHeight(event.detail.height > 0 ? event.detail.height : undefined);
          onFocus?.(event);
        }}
        onKeyboardHeightChange={event => {
          reportHeight(event.detail.height);
          onKeyboardHeightChange?.(event);
        }}
      />
    </View>
  );
}

function windowMetrics() {
  try {
    return (
      Taro.getWindowInfo?.() || {
        windowHeight: 0,
        windowWidth: 0,
        statusBarHeight: 0,
      }
    );
  } catch {
    return { windowHeight: 0, windowWidth: 0, statusBarHeight: 0 };
  }
}

/** PageFrame freezes the background; this owner fits controls above the keyboard. */
export default function BottomSheet({
  children,
  header,
  footer,
  onSubmit,
  bodyScrollTop,
  bodyScrollIntoView,
  onBodyScroll,
  className = "",
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  onSubmit?: ComponentProps<typeof Form>["onSubmit"];
  className?: string;
  bodyScrollTop?: number;
  bodyScrollIntoView?: string;
  onBodyScroll?: ComponentProps<typeof ScrollView>["onScroll"];
}) {
  const theme = useContext(FrameTheme);
  const accent = useContext(FrameAccent);
  const [sheetId] = useState(() => `sheet-layout-${++fieldSequence}`);
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null);
  const measure = useCallback(() => {
    if (typeof Taro.createSelectorQuery !== "function") { setNaturalHeight(0); return; }
    Taro.nextTick(() => {
      if (!alive.current) return;
      // A footer error/spinner can change the visible body while the keyboard
      // height stays constant. Reveal again only if the actual field is clipped;
      // never overwrite the measured resting height with compact keyboard sizes.
      if (keyboardRef.current > 0) {
        if (!focusedField.current) return;
        const query = Taro.createSelectorQuery();
        query.select(`#${sheetId}-body`).boundingClientRect();
        query.select(`#${focusedField.current}`).boundingClientRect();
        query.exec((boxes) => {
          if (!alive.current || keyboardRef.current <= 0) return;
          const [body, field] = boxes as ({top:number;bottom:number}|null)[];
          if (body && field && Number.isFinite(body.bottom) && Number.isFinite(field.bottom) &&
            (field.bottom > body.bottom + 1 || field.top < body.top - 1)) revealFocus();
        });
        return;
      }
      const query = Taro.createSelectorQuery();
      for (const part of ["header", "content", "footer"])
        query.select(`#${sheetId}-${part}`).boundingClientRect();
      query.exec((boxes) => {
        if (!alive.current || keyboardRef.current > 0) return;
        const total = boxes.reduce((sum: number, box: { height?: number } | null) => sum + (box?.height || 0), 1);
        if (total > 1) setNaturalHeight((previous) => Math.ceil(total) === previous ? previous : Math.ceil(total));
      });
    });
  }, [sheetId]);
  useLayoutEffect(measure);

  const [metrics, setMetrics] = useState(windowMetrics);
  const viewport = useViewport();
  const frame = viewportStyle(viewport);
  const capsuleBottom = (() => {
    try {
      return Taro.getMenuButtonBoundingClientRect?.()?.bottom || 0;
    } catch {
      return 0;
    }
  })();
  const resting = useRef(metrics);
  const metricsRef = useRef(metrics);
  const [keyboard, setKeyboard] = useState(0);
  const keyboardRef = useRef(0);
  const [focusAnchor, setFocusAnchor] = useState("");
  const focusedField = useRef("");
  const alive = useRef(true);
  const scrollIntent = useRef(0);
  const revealFocus = () => {
    const intent = ++scrollIntent.current;
    setFocusAnchor("");
    const reveal = () => {
      if (alive.current && intent === scrollIntent.current)
        setFocusAnchor(focusedField.current);
    };
    if (typeof Taro.nextTick === "function") Taro.nextTick(reveal);
    else void Promise.resolve().then(reveal);
  };
  const updateKeyboard = (height?: number, fieldId?: string) => {
    const focusChanged = !!fieldId && fieldId !== focusedField.current;
    if (fieldId) focusedField.current = fieldId;
    const nextHeight =
      height === undefined
        ? keyboardRef.current
        : Number.isFinite(height)
          ? Math.max(0, Math.round(height))
          : 0;
    const heightChanged = nextHeight !== keyboardRef.current;
    const next = windowMetrics();
    const windowChanged =
      next.windowHeight !== metricsRef.current.windowHeight ||
      next.windowWidth !== metricsRef.current.windowWidth ||
      next.statusBarHeight !== metricsRef.current.statusBarHeight;
    if (heightChanged) {
      keyboardRef.current = nextHeight;
      setKeyboard(nextHeight);
    }
    if (windowChanged) {
      metricsRef.current = next;
      setMetrics(next);
    }
    if (nextHeight > 0 && (heightChanged || focusChanged || windowChanged))
      revealFocus();
    if (heightChanged && !nextHeight) {
      ++scrollIntent.current;
      setFocusAnchor("");
    }
  };
  useEffect(() => {
    alive.current = true;
    const keyboardChanged = ({ height }: { height: number }) =>
      updateKeyboard(height);
    const resized = ({
      size,
    }: {
      size: { windowHeight: number; windowWidth: number };
    }) => {
      if (
        size.windowHeight === metricsRef.current.windowHeight &&
        size.windowWidth === metricsRef.current.windowWidth
      )
        return;
      if (
        size.windowWidth !== resting.current.windowWidth ||
        size.windowHeight > resting.current.windowHeight
      )
        resting.current = { ...resting.current, ...size };
      metricsRef.current = { ...metricsRef.current, ...size };
      setMetrics(metricsRef.current);
      if (keyboardRef.current > 0) revealFocus();
    };
    Taro.onKeyboardHeightChange?.(keyboardChanged);
    Taro.onWindowResize?.(resized);
    return () => {
      alive.current = false;
      ++scrollIntent.current;
      // A held keyboard must close with its sheet, rather than survive a dismissed portal.
      if (keyboardRef.current > 0)
        void Promise.resolve(Taro.hideKeyboard?.()).catch(() => {});
      Taro.offKeyboardHeightChange?.(keyboardChanged);
      // Taro 4 types offWindowResize with a generic callback, unlike its paired on API.
      Taro.offWindowResize?.(
        resized as unknown as Parameters<typeof Taro.offWindowResize>[0],
      );
    };
  }, []);
  const height = sheetViewportHeight(
    resting.current.windowHeight,
    metrics.windowHeight,
    keyboard,
  );
  const preferredHeight = className.split(" ").includes("score-sheet")
    ? 280
    : className.split(" ").includes("proxy-sheet")
      ? 340
      : 360;
  const fitted = keyboardSheetLayout(
    height,
    viewport.canvas,
    metrics.statusBarHeight || 0,
    preferredHeight,
    capsuleBottom,
  );
  const normalPreferredHeight = className.split(" ").includes("score-sheet")
    ? 400
    : className.split(" ").includes("proxy-sheet") ? 480 : 620;
  const normalHeight = Math.min(height * .82, naturalHeight || normalPreferredHeight * viewport.canvas / 375);
  const style = {
    ...frame,
    ...(height ? { height: `${height}px` } : {}),
    "--sheet-safe-top": `${metrics.statusBarHeight || 0}px`,
    "--sheet-height": `${keyboard > 0 ? fitted.height : normalHeight}px`,
    "--sheet-capsule-clearance":
      keyboard > 0 && fitted.overlapsCapsule
        ? frame["--page-capsule-clearance" as keyof CSSProperties]
        : "0px",
  } as CSSProperties;
  const content = (
    <>
      <View id={`${sheetId}-header`} className="profile-sheet-header">{header}</View>
      <ScrollView
        id={`${sheetId}-body`}
        className="profile-sheet-body"
        scrollY
        scrollTop={bodyScrollTop}
        onScroll={onBodyScroll}
        scrollIntoView={focusAnchor || bodyScrollIntoView}
        scrollWithAnimation={false}
      >
        <View id={`${sheetId}-content`} className="profile-sheet-content">{children}</View>
      </ScrollView>
      {footer && <View id={`${sheetId}-footer`} className="profile-sheet-footer">{footer}</View>}
    </>
  );
  const sheetClass = `profile-sheet ${naturalHeight !== null ? "profile-sheet-ready" : ""} ${className}`;
  return (
    <RootPortal>
      <View
        className={`profile-mask theme--${theme} ${keyboard > 0 ? "profile-keyboard-open" : ""}`}
        style={{ ...style, ...paletteStyle(accent) }}
      >
        <View className="profile-backdrop" catchMove />
        <KeyboardContext.Provider value={updateKeyboard}>
          <SheetMeasureContext.Provider value={measure}>
            {onSubmit ? (
              <Form className="profile-sheet-form" onSubmit={onSubmit}>
                <View className={sheetClass}>{content}</View>
              </Form>
            ) : (
              <View className={sheetClass}>{content}</View>
            )}
          </SheetMeasureContext.Provider>
        </KeyboardContext.Provider>
      </View>
    </RootPortal>
  );
}
