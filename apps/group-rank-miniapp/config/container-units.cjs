// Both WeChat and the source preview scale design lengths from the same live
// canvas unit. Physical Px targets and native API measurements remain physical.
module.exports = () => ({
  postcssPlugin: 'group-rank-container-units',
  OnceExit(root) {
    root.walkDecls(decl => {
      if (/url\(/i.test(decl.value)) return;
      decl.value = decl.value.replace(/(-?(?:\d*\.)?\d+)rpx\b/g, (_, value) =>
        Number(value) === 0 ? '0' : `calc(var(--ui-unit, 1px) * ${Number(value) / 2})`);
    });
  },
});
