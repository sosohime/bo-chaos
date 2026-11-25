Component({
  options: { multipleSlots: true, styleIsolation: "apply-shared" },
  properties: {
    label: String, backlabel: String, disabled: Boolean, leafkey: String,
    ready: Boolean, backready: Boolean, turnpulse: Number,
  },
  data: { width: 0, height: 0, nextHeight: 0, previousHeight: 0 },
  observers: {
    leafkey() { wx.nextTick(() => this.measure()); },
    ready() { wx.nextTick(() => this.measure()); },
    backready() { wx.nextTick(() => this.measure()); },
  },
  lifetimes: {
    ready() { this.measure(); },
  },
  pageLifetimes: {
    resize() { this.measure(); },
  },
  methods: {
    measure() {
      this.createSelectorQuery()
        .select(".sheet-front").boundingClientRect()
        .select(".sheet-next").boundingClientRect()
        .select(".sheet-previous").boundingClientRect()
        .exec(([front, next, previous]) => {
          if (front?.width && front.height)
            this.setData({
              width: front.width, height: front.height,
              nextHeight: next?.height || front.height,
              previousHeight: previous?.height || front.height,
            });
        });
    },
    tap(event) {
      if (!this.data.disabled && (this.ignoreTapUntil || 0) <= Date.now())
        this.triggerEvent("turn", { direction: Number(event.currentTarget.dataset.direction) });
    },
    finishGesture(payload) {
      this.ignoreTapUntil = Date.now() + 180;
      if (payload.turn && !this.data.disabled) this.triggerEvent("turn", { direction: payload.direction });
    },
  },
});
