import { beforeEach, describe, expect, it, vi } from "vitest";
const wx = vi.hoisted(() => ({
  getStorageSync: vi.fn(),
  setStorageSync: vi.fn(),
  showModal: vi.fn(),
}));
vi.mock("@tarojs/taro", () => ({ default: wx }));
import { offerGroupReturnHelp, showGroupReturnHelp } from "./return-guide";
beforeEach(() => {
  vi.resetAllMocks();
  wx.showModal.mockResolvedValue({ confirm: true });
});
describe("return guidance", () => {
  it("remembers acknowledgement locally without storing group or member information", async () => {
    await offerGroupReturnHelp();
    expect(wx.showModal).toHaveBeenCalledTimes(1);
    expect(wx.setStorageSync).toHaveBeenCalledWith(
      "group-rank-return-guide-v1",
      true,
    );
    wx.getStorageSync.mockReturnValue(true);
    await offerGroupReturnHelp();
    expect(wx.showModal).toHaveBeenCalledTimes(1);
    await showGroupReturnHelp();
    expect(wx.showModal).toHaveBeenCalledTimes(2);
  });
  it("does not turn a completed submission into a failure when guidance/storage fails", async () => {
    wx.getStorageSync.mockImplementation(() => {
      throw new Error("storage");
    });
    wx.showModal.mockRejectedValue(new Error("hidden"));
    await expect(offerGroupReturnHelp()).resolves.toBeUndefined();
    expect(wx.setStorageSync).not.toHaveBeenCalled();
  });
});
